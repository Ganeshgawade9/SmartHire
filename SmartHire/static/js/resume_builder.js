/**
 * AI Resume Builder Engine
 * Templates matching exact uploaded designs:
 * 1. ⚫ Classic (Template 1 - Jake Ryan PDF 1 Famous LaTeX Computer Science ATS Resume)
 * 2. ⚪ Minimal (Template 2 - Clean Monochromatic with Icons, Dividers & Skills Matrix)
 * 3. 🟦 Modern Blue (Template 3 - Philip Empl Two-Column Executive with Sidebar, Photo & Date Badges)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Main Resume Data State
  window.resumeState = {
    template: 'classic',
    full_name: 'Jake Ryan',
    headline: 'Full Stack Software Engineer',
    email: 'jake@su.edu',
    phone: '123-456-7890',
    location: 'Georgetown, TX',
    linkedin: 'linkedin.com/in/jake',
    github: 'github.com/jake',
    portfolio: 'jake.dev',
    photo: '',   // base64 data URL of uploaded profile photo
    summary: 'Results-driven Software Engineer with hands-on expertise building full-stack web applications, REST APIs, and microservices.',
    skills_languages: 'Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R',
    skills_frameworks: 'React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI',
    skills_tools: 'Git, Docker, TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Eclipse',
    skills_libraries: 'pandas, NumPy, Matplotlib',
    custom_skills: [],
    experiences: [
      {
        company: 'Texas A&M University',
        role: 'Undergraduate Research Assistant',
        dates: 'June 2020 – Present',
        location: 'College Station, TX',
        bullets: 'Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems\nDeveloped a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data\nExplored ways to visualize GitHub collaboration in a classroom setting'
      },
      {
        company: 'Southwestern University',
        role: 'Information Technology Support Specialist',
        dates: 'Sep. 2018 – Present',
        location: 'Georgetown, TX',
        bullets: 'Communicate with managers to set up campus computers used on campus\nAssess and troubleshoot computer problems brought by students, faculty and staff\nMaintain upkeep of computers, classroom equipment, and 200 printers across campus'
      },
      {
        company: 'Southwestern University',
        role: 'Artificial Intelligence Research Assistant',
        dates: 'May 2019 – July 2019',
        location: 'Georgetown, TX',
        bullets: 'Explored methods to generate video game dungeons based off of The Legend of Zelda\nDeveloped a game in Java to test the generated dungeons\nContributed 50K+ lines of code to an established codebase via Git\nConducted a human subject study to determine which video game dungeon generation technique is enjoyable\nWrote an 8-page paper and gave multiple presentations on-campus\nPresented virtually to the World Conference on Computational Intelligence'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Arts in Computer Science, Minor in Business',
        school: 'Southwestern University',
        year: 'Aug. 2018 – May 2021',
        location: 'Georgetown, TX'
      },
      {
        degree: "Associate's in Liberal Arts",
        school: 'Blinn College',
        year: 'Aug. 2014 – May 2018',
        location: 'Bryan, TX'
      }
    ],
    projects: [
      {
        name: 'Gitlytics',
        tech: 'Python, Flask, React, PostgreSQL, Docker',
        dates: 'June 2020 – Present',
        link: 'https://github.com/jake/gitlytics',
        description: 'Developed a full-stack web application using Flask serving a REST API with React as the frontend\nImplemented GitHub OAuth to get data from user\'s repositories\nVisualized GitHub data to show collaboration\nUsed Celery and Redis for asynchronous tasks'
      },
      {
        name: 'Simple Paintball',
        tech: 'Spigot API, Java, Maven, TravisCI, Git',
        dates: 'May 2018 – May 2020',
        link: 'https://github.com/jake/paintball',
        description: 'Developed a Minecraft server plugin to entertain kids during free time for a previous job\nPublished plugin to websites gaining 2K+ downloads and an average 4.5/5-star review\nImplemented continuous delivery using TravisCI to build the plugin upon new a release\nCollaborated with Minecraft server administrators to suggest features and get feedback about the plugin'
      }
    ],
    certifications: [],
    achievements: [],
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'German', level: 'Fluent' }
    ]
  };

  // Load initial data from server if provided
  if (window.INITIAL_RESUME_DATA) {
    Object.assign(window.resumeState, window.INITIAL_RESUME_DATA);
  }

  // Initialize Modules
  initStepNavigation();
  initTemplateSelection();
  initFormInputs();
  initPhotoUpload();       // NEW: photo upload handler
  initMultiEntryLists();
  initProjectAnalyzer();
  initAIPolisher();
  initPrintPreview();      // NEW: print preview overlay
  calculateATSScore();     // ATS runs on load; preview renders only on print

  // Step Navigation Logic
  function initStepNavigation() {
    const stepBtns = document.querySelectorAll('.rb-step-btn');
    const stepSections = document.querySelectorAll('.form-step-section');
    let currentStep = 1;

    function goToStep(stepNum) {
      currentStep = stepNum;
      stepBtns.forEach((btn, idx) => {
        const num = idx + 1;
        if (num === stepNum) {
          btn.classList.add('active');
          btn.classList.remove('completed');
        } else if (num < stepNum) {
          btn.classList.remove('active');
          btn.classList.add('completed');
        } else {
          btn.classList.remove('active', 'completed');
        }
      });

      stepSections.forEach(sec => {
        if (parseInt(sec.dataset.step) === stepNum) {
          sec.classList.remove('d-none');
        } else {
          sec.classList.add('d-none');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        goToStep(parseInt(btn.dataset.step));
      });
    });

    document.querySelectorAll('.btn-next-step').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep < 11) goToStep(currentStep + 1);
      });
    });

    document.querySelectorAll('.btn-prev-step').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) goToStep(currentStep - 1);
      });
    });
  }

  // Template Choice Logic
  function initTemplateSelection() {
    const choiceCards = document.querySelectorAll('.template-card-choice');
    choiceCards.forEach(card => {
      card.addEventListener('click', () => {
        choiceCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        window.resumeState.template = card.dataset.template;
        renderLivePreview();
      });
    });
  }

  // Sync Form Input Fields with State (NO auto-preview, only ATS score)
  function initFormInputs() {
    const inputs = document.querySelectorAll('[data-state-key]');
    inputs.forEach(input => {
      const key = input.dataset.stateKey;
      if (window.resumeState[key]) {
        input.value = window.resumeState[key];
      }
      input.addEventListener('input', () => {
        window.resumeState[key] = input.value;
        // Only recalculate score — DO NOT renderLivePreview here
        calculateATSScore();
      });
    });
  }

  // Photo Upload Handler
  function initPhotoUpload() {
    const photoInput = document.getElementById('photo-upload-input');
    if (!photoInput) return;
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        alert('Photo must be under 2 MB.');
        photoInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        window.resumeState.photo = ev.target.result;  // base64 data URL
        // Update thumbnail
        const thumb = document.getElementById('photo-thumb-img');
        const icon  = document.getElementById('photo-thumb-icon');
        if (thumb) { thumb.src = ev.target.result; thumb.style.display = 'block'; }
        if (icon)  { icon.style.display = 'none'; }
      };
      reader.readAsDataURL(file);
    });
  }

  // Print Preview Overlay
  function initPrintPreview() {
    const overlay   = document.getElementById('print-preview-overlay');
    const openBtn   = document.getElementById('btn-print-save');
    const printBtn  = document.getElementById('btn-do-print');
    const htmlBtn   = document.getElementById('btn-download-html-overlay');
    const closeBtn  = document.getElementById('btn-close-preview');

    openBtn?.addEventListener('click', () => {
      renderLivePreview();       // render once when button clicked
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });

    closeBtn?.addEventListener('click', () => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'block') {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }
    });

    printBtn?.addEventListener('click', () => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      setTimeout(() => window.print(), 100);
    });

    htmlBtn?.addEventListener('click', () => {
      const paperHtml = document.getElementById('resume-paper-preview')?.outerHTML || '';
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${window.resumeState.full_name} Resume</title>
      <style>body{background:#f8fafc;padding:40px;}.preview-paper{max-width:800px;margin:0 auto;background:white;padding:40px;box-shadow:0 10px 30px rgba(0,0,0,.1);}</style>
      </head><body>${paperHtml}</body></html>`;
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${(window.resumeState.full_name||'Resume').replace(/\s+/g,'_')}_Resume.html`;
      document.body.appendChild(a); a.click(); a.remove();
    });
  }

  // Dynamic Multi-Entry Handlers
  function initMultiEntryLists() {
    document.getElementById('add-exp-btn')?.addEventListener('click', () => {
      window.resumeState.experiences.push({
        company: 'New Company',
        role: 'Software Engineer',
        dates: 'June 2021 – Present',
        location: 'City, State',
        bullets: 'Developed scalable web application feature set\nOptimized API latency by 30%'
      });
      renderExperienceInputs();
      calculateATSScore();
    });

    document.getElementById('add-edu-btn')?.addEventListener('click', () => {
      window.resumeState.education.push({
        degree: 'Bachelor of Science in Computer Science',
        school: 'University Name',
        year: 'Aug. 2018 – May 2022',
        location: 'City, State'
      });
      renderEducationInputs();
      calculateATSScore();
    });

    document.getElementById('add-project-btn')?.addEventListener('click', () => {
      window.resumeState.projects.push({
        name: 'New Project',
        tech: 'Python, React, PostgreSQL',
        dates: '2022 – Present',
        link: 'https://github.com/user/project',
        description: 'Engineered high-performance web platform\nImplemented automated testing suite'
      });
      renderProjectInputs();
      calculateATSScore();
    });

    document.getElementById('add-skill-cat-btn')?.addEventListener('click', () => {
      window.resumeState.custom_skills.push({
        title: 'Cloud & DevOps',
        items: 'AWS, Docker, Kubernetes, CI/CD'
      });
      renderCustomSkillCategoryInputs();
      calculateATSScore();
    });

    document.getElementById('add-cert-btn')?.addEventListener('click', () => {
      window.resumeState.certifications.push({
        name: 'Professional Certification',
        issuer: 'Issuing Organization',
        date: '2023'
      });
      renderCertInputs();
      calculateATSScore();
    });

    document.getElementById('add-award-btn')?.addEventListener('click', () => {
      window.resumeState.achievements.push({
        title: 'Leadership & Innovation Award',
        desc: 'Recognized for technical excellence and project delivery.',
        year: '2023'
      });
      renderAchievementInputs();
      calculateATSScore();
    });

    document.getElementById('add-lang-btn')?.addEventListener('click', () => {
      window.resumeState.languages.push({
        name: 'Spanish',
        level: 'Intermediate'
      });
      renderLanguageInputs();
      calculateATSScore();
    });

    renderExperienceInputs();
    renderEducationInputs();
    renderProjectInputs();
    renderCustomSkillCategoryInputs();
    renderCertInputs();
    renderAchievementInputs();
    renderLanguageInputs();
  }

  function renderExperienceInputs() {
    const container = document.getElementById('experience-list-container');
    if (!container) return;
    container.innerHTML = '';

    window.resumeState.experiences.forEach((exp, idx) => {
      const card = document.createElement('div');
      card.className = 'multi-entry-item shadow-sm';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="fw-semibold text-muted" style="font-size:.78rem;"><i class="bi bi-briefcase me-1"></i>Position #${idx + 1}</span>
          <button class="btn btn-sm btn-outline-danger btn-remove py-0 px-2" style="font-size:.75rem;"><i class="bi bi-trash me-1"></i>Remove</button>
        </div>
        <div class="entry-card-body">
          <div class="row g-2">
            <div class="col-md-6"><input type="text" class="form-control form-control-sm exp-role" placeholder="Job Title / Role" value="${exp.role || ''}"></div>
            <div class="col-md-6"><input type="text" class="form-control form-control-sm exp-date" placeholder="Dates (e.g. June 2020 – Present)" value="${exp.dates || ''}"></div>
            <div class="col-md-6"><input type="text" class="form-control form-control-sm exp-comp" placeholder="Company Name" value="${exp.company || ''}"></div>
            <div class="col-md-6"><input type="text" class="form-control form-control-sm exp-loc" placeholder="Location" value="${exp.location || ''}"></div>
            <div class="col-12 mt-1">
              <label class="form-label small text-muted mb-1">Bullet Points (one per line)</label>
              <textarea class="form-control form-control-sm exp-bullets" rows="3">${exp.bullets || ''}</textarea>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.btn-remove').addEventListener('click', () => {
        window.resumeState.experiences.splice(idx, 1);
        renderExperienceInputs();
        renderLivePreview();
        calculateATSScore();
      });

      card.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
          exp.company = card.querySelector('.exp-comp').value;
          exp.role = card.querySelector('.exp-role').value;
          exp.dates = card.querySelector('.exp-date').value;
          exp.location = card.querySelector('.exp-loc').value;
          exp.bullets = card.querySelector('.exp-bullets').value;
          renderLivePreview();
          calculateATSScore();
        });
      });

      container.appendChild(card);
    });
  }

  function renderEducationInputs() {
    const container = document.getElementById('education-list-container');
    if (!container) return;
    container.innerHTML = '';

    window.resumeState.education.forEach((edu, idx) => {
      const card = document.createElement('div');
      card.className = 'multi-entry-item shadow-sm';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="fw-semibold text-muted" style="font-size:.78rem;"><i class="bi bi-mortarboard me-1"></i>Education #${idx + 1}</span>
          <button class="btn btn-sm btn-outline-danger btn-remove py-0 px-2" style="font-size:.75rem;"><i class="bi bi-trash me-1"></i>Remove</button>
        </div>
        <div class="entry-card-body">
          <div class="row g-2">
            <div class="col-md-6"><input type="text" class="form-control form-control-sm edu-sch" placeholder="University / School" value="${edu.school || ''}"></div>
            <div class="col-md-6"><input type="text" class="form-control form-control-sm edu-loc" placeholder="Location (e.g. Georgetown, TX)" value="${edu.location || ''}"></div>
            <div class="col-md-6"><input type="text" class="form-control form-control-sm edu-deg" placeholder="Degree / Qualification" value="${edu.degree || ''}"></div>
            <div class="col-md-6"><input type="text" class="form-control form-control-sm edu-yr" placeholder="Dates (e.g. Aug. 2018 – May 2021)" value="${edu.year || ''}"></div>
          </div>
        </div>
      `;

      card.querySelector('.btn-remove').addEventListener('click', () => {
        window.resumeState.education.splice(idx, 1);
        renderEducationInputs();
        renderLivePreview();
        calculateATSScore();
      });

      card.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
          edu.school = card.querySelector('.edu-sch').value;
          edu.degree = card.querySelector('.edu-deg').value;
          edu.year = card.querySelector('.edu-yr').value;
          edu.location = card.querySelector('.edu-loc').value;
          renderLivePreview();
          calculateATSScore();
        });
      });

      container.appendChild(card);
    });
  }

  function renderProjectInputs() {
    const container = document.getElementById('project-list-container');
    if (!container) return;
    container.innerHTML = '';

    window.resumeState.projects.forEach((proj, idx) => {
      const card = document.createElement('div');
      card.className = 'multi-entry-item shadow-sm';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="fw-semibold text-muted" style="font-size:.78rem;"><i class="bi bi-code-slash me-1"></i>Project #${idx + 1}</span>
          <button class="btn btn-sm btn-outline-danger btn-remove py-0 px-2" style="font-size:.75rem;"><i class="bi bi-trash me-1"></i>Remove</button>
        </div>
        <div class="entry-card-body">
          <div class="row g-2">
            <div class="col-md-5"><input type="text" class="form-control form-control-sm proj-name" placeholder="Project Name" value="${proj.name || ''}"></div>
            <div class="col-md-4"><input type="text" class="form-control form-control-sm proj-tech" placeholder="Tech Stack" value="${proj.tech || ''}"></div>
            <div class="col-md-3"><input type="text" class="form-control form-control-sm proj-dt" placeholder="Dates" value="${proj.dates || ''}"></div>
            <div class="col-12 mt-1">
              <textarea class="form-control form-control-sm proj-desc" rows="2" placeholder="Description & Bullet points (one per line)">${proj.description || ''}</textarea>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.btn-remove').addEventListener('click', () => {
        window.resumeState.projects.splice(idx, 1);
        renderProjectInputs();
        renderLivePreview();
        calculateATSScore();
      });

      card.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
          proj.name = card.querySelector('.proj-name').value;
          proj.tech = card.querySelector('.proj-tech').value;
          proj.dates = card.querySelector('.proj-dt').value;
          proj.description = card.querySelector('.proj-desc').value;
          renderLivePreview();
          calculateATSScore();
        });
      });

      container.appendChild(card);
    });
  }

  function renderCustomSkillCategoryInputs() {
    const container = document.getElementById('skills-custom-list-container');
    if (!container) return;
    container.innerHTML = '';

    window.resumeState.custom_skills.forEach((sk, idx) => {
      const card = document.createElement('div');
      card.className = 'multi-entry-item shadow-sm';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="fw-semibold text-muted" style="font-size:.78rem;"><i class="bi bi-tools me-1"></i>Skill Category #${idx + 1}</span>
          <button class="btn btn-sm btn-outline-danger btn-remove py-0 px-2" style="font-size:.75rem;"><i class="bi bi-trash me-1"></i>Remove</button>
        </div>
        <div class="entry-card-body">
          <div class="row g-2">
            <div class="col-md-4"><input type="text" class="form-control form-control-sm sk-title" placeholder="Category (e.g. Cloud & DevOps)" value="${sk.title || ''}"></div>
            <div class="col-md-8"><input type="text" class="form-control form-control-sm sk-items" placeholder="Skills (comma separated)" value="${sk.items || ''}"></div>
          </div>
        </div>
      `;

      card.querySelector('.btn-remove').addEventListener('click', () => {
        window.resumeState.custom_skills.splice(idx, 1);
        renderCustomSkillCategoryInputs();
        renderLivePreview();
        calculateATSScore();
      });

      card.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
          sk.title = card.querySelector('.sk-title').value;
          sk.items = card.querySelector('.sk-items').value;
          renderLivePreview();
          calculateATSScore();
        });
      });

      container.appendChild(card);
    });
  }

  function renderCertInputs() {
    const container = document.getElementById('cert-list-container');
    if (!container) return;
    container.innerHTML = '';

    window.resumeState.certifications.forEach((cert, idx) => {
      const card = document.createElement('div');
      card.className = 'multi-entry-item shadow-sm';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="fw-semibold text-muted" style="font-size:.78rem;"><i class="bi bi-patch-check me-1"></i>Certification #${idx + 1}</span>
          <button class="btn btn-sm btn-outline-danger btn-remove py-0 px-2" style="font-size:.75rem;"><i class="bi bi-trash me-1"></i>Remove</button>
        </div>
        <div class="entry-card-body">
          <div class="row g-2">
            <div class="col-md-5"><input type="text" class="form-control form-control-sm cert-name" placeholder="Certification Name" value="${cert.name || ''}"></div>
            <div class="col-md-5"><input type="text" class="form-control form-control-sm cert-iss" placeholder="Issuer (e.g. AWS, Google)" value="${cert.issuer || ''}"></div>
            <div class="col-md-2"><input type="text" class="form-control form-control-sm cert-dt" placeholder="Year" value="${cert.date || ''}"></div>
          </div>
        </div>
      `;

      card.querySelector('.btn-remove').addEventListener('click', () => {
        window.resumeState.certifications.splice(idx, 1);
        renderCertInputs();
        renderLivePreview();
        calculateATSScore();
      });

      card.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
          cert.name = card.querySelector('.cert-name').value;
          cert.issuer = card.querySelector('.cert-iss').value;
          cert.date = card.querySelector('.cert-dt').value;
          renderLivePreview();
          calculateATSScore();
        });
      });

      container.appendChild(card);
    });
  }

  function renderAchievementInputs() {
    const container = document.getElementById('achievements-list-container');
    if (!container) return;
    container.innerHTML = '';

    window.resumeState.achievements.forEach((ach, idx) => {
      const card = document.createElement('div');
      card.className = 'multi-entry-item shadow-sm';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="fw-semibold text-muted" style="font-size:.78rem;"><i class="bi bi-trophy me-1"></i>Award #${idx + 1}</span>
          <button class="btn btn-sm btn-outline-danger btn-remove py-0 px-2" style="font-size:.75rem;"><i class="bi bi-trash me-1"></i>Remove</button>
        </div>
        <div class="entry-card-body">
          <div class="row g-2">
            <div class="col-md-8"><input type="text" class="form-control form-control-sm ach-title" placeholder="Award / Achievement Title" value="${ach.title || ''}"></div>
            <div class="col-md-4"><input type="text" class="form-control form-control-sm ach-yr" placeholder="Year" value="${ach.year || ''}"></div>
            <div class="col-12 mt-1"><textarea class="form-control form-control-sm ach-desc" rows="2" placeholder="Description">${ach.desc || ''}</textarea></div>
          </div>
        </div>
      `;

      card.querySelector('.btn-remove').addEventListener('click', () => {
        window.resumeState.achievements.splice(idx, 1);
        renderAchievementInputs();
        renderLivePreview();
        calculateATSScore();
      });

      card.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
          ach.title = card.querySelector('.ach-title').value;
          ach.year = card.querySelector('.ach-yr').value;
          ach.desc = card.querySelector('.ach-desc').value;
          renderLivePreview();
          calculateATSScore();
        });
      });

      container.appendChild(card);
    });
  }

  function renderLanguageInputs() {
    const container = document.getElementById('languages-list-container');
    if (!container) return;
    container.innerHTML = '';

    window.resumeState.languages.forEach((lang, idx) => {
      const card = document.createElement('div');
      card.className = 'multi-entry-item shadow-sm';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="fw-semibold text-muted" style="font-size:.78rem;"><i class="bi bi-translate me-1"></i>Language #${idx + 1}</span>
          <button class="btn btn-sm btn-outline-danger btn-remove py-0 px-2" style="font-size:.75rem;"><i class="bi bi-trash me-1"></i>Remove</button>
        </div>
        <div class="entry-card-body">
          <div class="row g-2">
            <div class="col-md-6"><input type="text" class="form-control form-control-sm lang-name" placeholder="Language Name" value="${lang.name || ''}"></div>
            <div class="col-md-6">
              <select class="form-select form-select-sm lang-lvl">
                <option value="Native" ${lang.level === 'Native' ? 'selected' : ''}>Native</option>
                <option value="Fluent" ${lang.level === 'Fluent' ? 'selected' : ''}>Fluent</option>
                <option value="Intermediate" ${lang.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                <option value="Basic" ${lang.level === 'Basic' ? 'selected' : ''}>Basic</option>
              </select>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.btn-remove').addEventListener('click', () => {
        window.resumeState.languages.splice(idx, 1);
        renderLanguageInputs();
        renderLivePreview();
        calculateATSScore();
      });

      card.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('change', () => {
          lang.name = card.querySelector('.lang-name').value;
          lang.level = card.querySelector('.lang-lvl').value;
          renderLivePreview();
          calculateATSScore();
        });
      });

      container.appendChild(card);
    });
  }

  // AI Project Analyzer
  function initProjectAnalyzer() {
    const fileInput = document.getElementById('analyzer-file-input');
    const analyzeBtn = document.getElementById('btn-analyze-project');
    const resultBox = document.getElementById('analyzer-result-box');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            document.getElementById('analyzer-project-text').value = event.target.result;
          };
          reader.readAsText(file);
        }
      });
    }

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        const title = document.getElementById('analyzer-project-title')?.value || '';
        const content = document.getElementById('analyzer-project-text')?.value || '';
        const githubUrl = document.getElementById('analyzer-github-url')?.value || '';

        analyzeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Analyzing...';
        analyzeBtn.disabled = true;

        try {
          const resp = await fetch('/resume/api/analyze-project/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ title, content, github_url: githubUrl })
          });
          const data = await resp.json();

          if (data.success) {
            resultBox.classList.remove('d-none');
            document.getElementById('res-tech-badges').innerHTML = data.technologies.map(t => `<span class="badge bg-primary me-1 mb-1">${t}</span>`).join('');
            document.getElementById('res-bullets').innerHTML = data.bullets.map(b => `<li class="mb-1">${b}</li>`).join('');

            window.latestAnalyzedProject = {
              name: data.title,
              tech: data.tech_stack_str,
              dates: 'Present',
              link: githubUrl,
              description: data.bullets.join('\n')
            };
          }
        } catch (err) {
          console.error(err);
          alert('Failed to analyze project.');
        } finally {
          analyzeBtn.innerHTML = '<i class="bi bi-cpu me-2"></i>Analyze Project with AI';
          analyzeBtn.disabled = false;
        }
      });
    }

    document.getElementById('btn-apply-analyzed')?.addEventListener('click', () => {
      if (window.latestAnalyzedProject) {
        window.resumeState.projects.push({
          name: window.latestAnalyzedProject.name,
          tech: window.latestAnalyzedProject.tech,
          dates: window.latestAnalyzedProject.dates,
          link: window.latestAnalyzedProject.link,
          description: window.latestAnalyzedProject.description
        });
        renderProjectInputs();
        renderLivePreview();
        calculateATSScore();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('analyzerModal'));
        if (modal) modal.hide();
        alert('Project added to your resume!');
      }
    });
  }

  function initAIPolisher() {
    document.getElementById('btn-polish-summary')?.addEventListener('click', async () => {
      const text = window.resumeState.summary;
      if (!text) return alert('Please write a summary first.');

      const btn = document.getElementById('btn-polish-summary');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Polishing...';

      try {
        const resp = await fetch('/resume/api/polish-text/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
          },
          body: JSON.stringify({ text, type: 'summary' })
        });
        const data = await resp.json();
        if (data.success) {
          window.resumeState.summary = data.polished_text;
          const summaryInput = document.querySelector('[data-state-key="summary"]');
          if (summaryInput) summaryInput.value = data.polished_text;
          renderLivePreview();
          calculateATSScore();
        }
      } catch (err) {
        console.error(err);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-magic me-1"></i>AI Polish Summary';
      }
    });
  }

  // Live Resume Render Engine
  function renderLivePreview() {
    const paper = document.getElementById('resume-paper-preview');
    if (!paper) return;

    const s = window.resumeState;
    const tmpl = s.template || 'classic';
    paper.className = `preview-paper tmpl-${tmpl}`;

    // -----------------------------------------------------------------------
    // TEMPLATE 1: CLASSIC (⚫) - JAKE RYAN FAMOUS LATEX RESUME (PDF 1)
    // -----------------------------------------------------------------------
    if (tmpl === 'classic') {
      const contacts = [];
      if (s.phone) contacts.push(s.phone);
      if (s.email) contacts.push(`<a href="mailto:${s.email}">${s.email}</a>`);
      if (s.linkedin) contacts.push(`<a href="https://${s.linkedin.replace(/^https?:\/\//,'')}">${s.linkedin.replace(/^https?:\/\//,'')}</a>`);
      if (s.github) contacts.push(`<a href="https://${s.github.replace(/^https?:\/\//,'')}">${s.github.replace(/^https?:\/\//,'')}</a>`);

      paper.innerHTML = `
        <div class="jake-header">
          <h1 class="jake-name">${s.full_name || 'Jake Ryan'}</h1>
          <div class="jake-contacts">${contacts.join(' | ')}</div>
        </div>

        ${s.education.length ? `
          <div class="jake-section">
            <div class="jake-sec-title">Education</div>
            ${s.education.map(edu => `
              <div style="margin-bottom:6px;">
                <div class="jake-row">
                  <span class="jake-title-bold">${edu.school}</span>
                  <span class="jake-right-text">${edu.location || ''}</span>
                </div>
                <div class="jake-row">
                  <span class="jake-sub-italic">${edu.degree}</span>
                  <span class="jake-right-text jake-sub-italic">${edu.year || ''}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${s.experiences.length ? `
          <div class="jake-section">
            <div class="jake-sec-title">Experience</div>
            ${s.experiences.map(exp => `
              <div style="margin-bottom:8px;">
                <div class="jake-row">
                  <span class="jake-title-bold">${exp.role}</span>
                  <span class="jake-right-text">${exp.dates || ''}</span>
                </div>
                <div class="jake-row">
                  <span class="jake-sub-italic">${exp.company}</span>
                  <span class="jake-right-text jake-sub-italic">${exp.location || ''}</span>
                </div>
                <ul class="jake-bullets">
                  ${(exp.bullets || '').split('\n').filter(Boolean).map(b => `<li>${b.replace(/^[•\-\*]\s*/, '')}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${s.projects.length ? `
          <div class="jake-section">
            <div class="jake-sec-title">Projects</div>
            ${s.projects.map(p => `
              <div style="margin-bottom:8px;">
                <div class="jake-row">
                  <span class="jake-title-bold">${p.name} <span class="jake-sub-italic" style="font-weight:normal;">| ${p.tech}</span></span>
                  <span class="jake-right-text">${p.dates || ''}</span>
                </div>
                <ul class="jake-bullets">
                  ${(p.description || '').split('\n').filter(Boolean).map(b => `<li>${b.replace(/^[•\-\*]\s*/, '')}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="jake-section">
          <div class="jake-sec-title">Technical Skills</div>
          ${s.skills_languages ? `<div class="jake-skills-row"><strong>Languages:</strong> ${s.skills_languages}</div>` : ''}
          ${s.skills_frameworks ? `<div class="jake-skills-row"><strong>Frameworks:</strong> ${s.skills_frameworks}</div>` : ''}
          ${s.skills_tools ? `<div class="jake-skills-row"><strong>Developer Tools:</strong> ${s.skills_tools}</div>` : ''}
          ${s.skills_libraries ? `<div class="jake-skills-row"><strong>Libraries:</strong> ${s.skills_libraries}</div>` : ''}
          ${(s.custom_skills || []).map(sk => `<div class="jake-skills-row"><strong>${sk.title}:</strong> ${sk.items}</div>`).join('')}
        </div>

        ${s.certifications.length ? `
          <div class="jake-section">
            <div class="jake-sec-title">Certifications</div>
            <ul class="jake-bullets">
              ${s.certifications.map(c => `<li><strong>${c.name}</strong> — ${c.issuer} (${c.date})</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${s.achievements.length ? `
          <div class="jake-section">
            <div class="jake-sec-title">Achievements & Awards</div>
            <ul class="jake-bullets">
              ${s.achievements.map(a => `<li><strong>${a.title}</strong> (${a.year}): ${a.desc}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      `;
    }

    // -----------------------------------------------------------------------
    // TEMPLATE 2: MINIMAL (⚪) - CLEAN MONOCHROMATIC WITH ICONS (PDF 2)
    // -----------------------------------------------------------------------
    else if (tmpl === 'minimal') {
      const minIcons = [];
      if (s.github) minIcons.push(`<i class="bi bi-github"></i> ${s.github.replace(/^https?:\/\//,'')}`);
      if (s.linkedin) minIcons.push(`<i class="bi bi-linkedin"></i> ${s.linkedin.replace(/^https?:\/\//,'')}`);
      if (s.portfolio) minIcons.push(`<i class="bi bi-globe"></i> ${s.portfolio.replace(/^https?:\/\//,'')}`);
      if (s.email) minIcons.push(`<i class="bi bi-envelope"></i> ${s.email}`);
      if (s.phone) minIcons.push(`<i class="bi bi-telephone"></i> ${s.phone}`);

      paper.innerHTML = `
        <div class="min-header">
          <h1 class="min-name">${s.full_name || 'Your Name'}</h1>
          <div class="min-icons-row">${minIcons.join(' | ')}</div>
        </div>

        ${s.summary ? `
          <div class="min-section">
            <div class="min-sec-title">Summary</div>
            <p style="margin:0; font-size:9.5pt; color:#222;">${s.summary}</p>
          </div>
        ` : ''}

        ${s.experiences.length ? `
          <div class="min-section">
            <div class="min-sec-title">Work Experience</div>
            ${s.experiences.map(exp => `
              <div style="margin-bottom:10px;">
                <div class="min-entry-header">
                  <span>${exp.role}</span>
                  <span>${exp.dates}</span>
                </div>
                <ul class="min-dash-bullets">
                  ${(exp.bullets || '').split('\n').filter(Boolean).map(b => `<li>${b.replace(/^[•\-\*\–]\s*/, '')}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${s.projects.length ? `
          <div class="min-section">
            <div class="min-sec-title">Projects</div>
            ${s.projects.map(p => `
              <div style="margin-bottom:10px;">
                <div class="min-entry-header">
                  <span>${p.name}</span>
                  <a href="${p.link || '#'}" style="color:#2563eb; font-weight:normal; text-decoration:none;">Link to Demo</a>
                </div>
                <ul class="min-dash-bullets">
                  ${(p.description || '').split('\n').filter(Boolean).map(b => `<li>${b.replace(/^[•\-\*\–]\s*/, '')}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${s.education.length ? `
          <div class="min-section">
            <div class="min-sec-title">Education</div>
            ${s.education.map(edu => `
              <div class="min-edu-row">
                <span><strong>${edu.year}</strong> ${edu.degree} at <strong>${edu.school}</strong></span>
                <span>(GPA: 4.0/4.0)</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="min-section">
          <div class="min-sec-title">Skills</div>
          <table class="min-skills-table">
            ${s.skills_languages ? `<tr><td class="cat">Languages</td><td>${s.skills_languages}</td></tr>` : ''}
            ${s.skills_frameworks ? `<tr><td class="cat">Frameworks</td><td>${s.skills_frameworks}</td></tr>` : ''}
            ${s.skills_tools ? `<tr><td class="cat">Developer Tools</td><td>${s.skills_tools}</td></tr>` : ''}
            ${(s.custom_skills || []).map(sk => `<tr><td class="cat">${sk.title}</td><td>${sk.items}</td></tr>`).join('')}
          </table>
        </div>

        ${s.certifications.length ? `
          <div class="min-section">
            <div class="min-sec-title">Certifications</div>
            <ul class="min-dash-bullets">
              ${s.certifications.map(c => `<li><strong>${c.name}</strong> – ${c.issuer} (${c.date})</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${s.languages.length ? `
          <div class="min-section">
            <div class="min-sec-title">Languages</div>
            <p style="margin:0; font-size:9.5pt;">${s.languages.map(l => `<strong>${l.name}:</strong> ${l.level}`).join(' | ')}</p>
          </div>
        ` : ''}

        <div style="margin-top:20px; text-align:center; font-size:8.5pt; color:#64748b;">
          Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      `;
    }

    // -----------------------------------------------------------------------
    // TEMPLATE 3: MODERN BLUE (🟦) - PHILIP EMPL TWO-COLUMN EXECUTIVE (PDF 3)
    // -----------------------------------------------------------------------
    else if (tmpl === 'modern') {
      paper.innerHTML = `
        <div class="tmpl-modern">
          <!-- Sidebar -->
          <div class="mod-sidebar">
            <div class="mod-top-cv-tag">CV</div>
            <div class="mod-sidebar-content">
              ${s.photo ? `
                <div style="width:100%;height:190px;border-radius:6px;overflow:hidden;margin-bottom:12px;background:#e2e8f0;">
                  <img src="${s.photo}" style="width:100%;height:100%;object-fit:cover;" alt="Profile Photo">
                </div>
              ` : ''}
              <div class="mod-name">${s.full_name || 'Philip Empl'}</div>
              <div class="mod-title-sub">${s.headline || 'Management Information Systems'}</div>

              <div class="mod-info-list">
                ${s.location ? `<div><i class="bi bi-geo-alt"></i> ${s.location}</div>` : ''}
                ${s.email ? `<div><i class="bi bi-envelope"></i> ${s.email}</div>` : ''}
                ${s.phone ? `<div><i class="bi bi-telephone"></i> ${s.phone}</div>` : ''}
                ${s.github ? `<div><i class="bi bi-github"></i> ${s.github}</div>` : ''}
              </div>

              <div class="mod-sec-title">Skills</div>
              ${s.skills_languages ? `
                <div class="mod-skill-item">
                  <div class="mod-skill-header"><span>Languages</span><span>Pro</span></div>
                  <div class="mod-skill-bar"><div class="mod-skill-fill" style="width: 90%;"></div></div>
                </div>
              ` : ''}
              ${s.skills_frameworks ? `
                <div class="mod-skill-item">
                  <div class="mod-skill-header"><span>Frameworks</span><span>Advanced</span></div>
                  <div class="mod-skill-bar"><div class="mod-skill-fill" style="width: 85%;"></div></div>
                </div>
              ` : ''}
              ${(s.custom_skills || []).map(sk => `
                <div class="mod-skill-item">
                  <div class="mod-skill-header"><span>${sk.title}</span><span>Expert</span></div>
                  <div class="mod-skill-bar"><div class="mod-skill-fill" style="width: 80%;"></div></div>
                </div>
              `).join('')}

              ${s.languages.length ? `
                <div class="mod-sec-title">Languages</div>
                ${s.languages.map(l => `<div class="mod-skill-header"><span>${l.name}</span><span>${l.level}</span></div>`).join('')}
              ` : ''}
            </div>
          </div>

          <!-- Main Column -->
          <div class="mod-main">
            ${s.summary ? `
              <div class="mod-main-sec-title">Biography</div>
              <p class="mod-desc-text">${s.summary}</p>
            ` : ''}

            ${s.experiences.length ? `
              <div class="mod-main-sec-title">Work experience</div>
              ${s.experiences.map(exp => `
                <div class="mod-entry">
                  <div class="mod-entry-header">
                    <span class="mod-role-bold">${exp.role}</span>
                    <span class="mod-date-badge">${exp.dates || 'XX/XXXX - today'}</span>
                  </div>
                  <div class="mod-company-sub">${exp.company}</div>
                  <p class="mod-desc-text">${(exp.bullets || '').replace(/\n/g, '<br>')}</p>
                </div>
              `).join('')}
            ` : ''}

            ${s.education.length ? `
              <div class="mod-main-sec-title">Education</div>
              ${s.education.map(edu => `
                <div class="mod-entry">
                  <div class="mod-entry-header">
                    <span class="mod-role-bold">${edu.degree}</span>
                    <span class="mod-date-badge">${edu.year || 'XX/XXXX'}</span>
                  </div>
                  <div class="mod-company-sub">${edu.school}</div>
                </div>
              `).join('')}
            ` : ''}

            ${s.certifications.length ? `
              <div class="mod-main-sec-title">Certifications</div>
              ${s.certifications.map(c => `
                <div class="mod-entry mb-2">
                  <div class="mod-role-bold">${c.name} — <small class="text-muted">${c.issuer} (${c.date})</small></div>
                </div>
              `).join('')}
            ` : ''}

            <div style="margin-top:40px; border-top:1px solid #cbd5e1; padding-top:10px; display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b;">
              <span>${s.location || 'Lorem'}, ${new Date().toLocaleDateString()}</span>
              <span style="font-weight:600;">${s.full_name || 'Philip Empl'}</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // ATS Score Calculator Engine
  function calculateATSScore() {
    const s = window.resumeState;
    let score = 0;
    const suggestions = [];

    if (s.full_name && s.email && s.phone) {
      score += 15;
    } else {
      suggestions.push('Add complete contact details (Name, Email, Phone)');
    }

    if (s.summary && s.summary.length >= 30) {
      score += 15;
    } else {
      suggestions.push('Add a concise summary paragraph');
    }

    if (s.experiences && s.experiences.length > 0) {
      score += 30;
    } else {
      suggestions.push('Add work experience positions');
    }

    if (s.education && s.education.length > 0) {
      score += 15;
    } else {
      suggestions.push('Add education history');
    }

    if (s.skills_languages || s.skills_frameworks || (s.custom_skills && s.custom_skills.length)) {
      score += 15;
    } else {
      suggestions.push('Categorize technical skills (Languages, Frameworks, Tools)');
    }

    if (s.certifications && s.certifications.length) {
      score += 10;
    }

    const scoreVal = Math.min(100, score);
    const textEl = document.getElementById('ats-score-value');
    const circleEl = document.getElementById('ats-circle-bar');
    const suggestionsContainer = document.getElementById('ats-suggestions-list');

    if (textEl) textEl.textContent = `${scoreVal}%`;
    if (circleEl) {
      const angle = (scoreVal / 100) * 360;
      circleEl.style.setProperty('--score-angle', `${angle}deg`);
    }

    if (suggestionsContainer) {
      if (suggestions.length === 0) {
        suggestionsContainer.innerHTML = '<li class="text-success small">🎉 Perfect! High ATS compatibility.</li>';
      } else {
        suggestionsContainer.innerHTML = suggestions.map(sug => `<li class="mb-1 text-warning small">💡 ${sug}</li>`).join('');
      }
    }
  }

  // Download Handlers
  document.getElementById('btn-download-pdf')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-download-docx')?.addEventListener('click', async () => {
    try {
      const resp = await fetch('/resume/export/docx/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(window.resumeState)
      });
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(window.resumeState.full_name || 'Resume').replace(/\s+/g, '_')}_Resume.doc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to export Word document.');
    }
  });

  document.getElementById('btn-download-html')?.addEventListener('click', () => {
    const paperHtml = document.getElementById('resume-paper-preview')?.outerHTML || '';
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${window.resumeState.full_name} Resume</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { background: #f8fafc; padding: 40px; }
      .preview-paper { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    </style></head><body>${paperHtml}</body></html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(window.resumeState.full_name || 'Resume').replace(/\s+/g, '_')}_Resume.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
  }
});
