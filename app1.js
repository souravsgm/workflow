/**
 * ==========================================================================
 * ROBO_SYSTEMS CORE APPLICATION & STATE MANAGEMENT (OPTIMIZED & BUG-FIXED)
 * ==========================================================================
 */

import { RoboViewer } from './viewer3d.js';

// Initial projects structure (seeded if no localStorage is present)
const SEED_PROJECTS = [
  {
    id: "communication-robot",
    name: "COMMUNICATION ROBOT",
    description: "Sleek hovering assistant robot with built-in voice processing and visual display. Designed for question-answering and communication in lab environments.",
    currentMilestoneIdx: 1, 
    milestones: ["Concept", "3D Printing", "Electronics Setup", "Language Model", "Field Testing"],
    checklist: [],
    files: [
      { 
        id: "f1", 
        name: "LLM_Integrator_API_Spec.pdf", 
        category: "pdf", 
        size: "1.2 MB", 
        date: "2026-06-25", 
        url: "#", 
        isLocal: false,
        dataUrl: "" 
      },
      { 
        id: "f2", 
        name: "chassis_wireframe_render.jpg", 
        category: "image", 
        size: "450 KB", 
        date: "2026-06-24", 
        url: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop", 
        isLocal: false,
        dataUrl: "" 
      }
    ],
    parts: [
      { id: "p1", name: "Raspberry Pi 4 (8GB)", qty: 1, cost: 75.00, status: "Arrived" },
      { id: "p2", name: "ReSpeaker 4-Mic Array Shield", qty: 1, cost: 24.50, status: "Arrived" },
      { id: "p3", name: "2300kv Brushless Drone Motors", qty: 4, cost: 12.00, status: "Ordered" },
      { id: "p4", name: "LiPo Battery Pack 4S 1500mAh", qty: 2, cost: 22.00, status: "Pending" }
    ],
    changelog: [
      { id: "ch1", timestamp: "2026-06-26 10:12:05", user: "ADMIN", action: "Created project & uploaded wireframe drawings." },
      { id: "ch2", timestamp: "2026-06-26 12:45:18", user: "ADMIN", action: "Added Raspberry Pi 4 and ReSpeaker core parts." },
      { id: "ch3", timestamp: "2026-06-26 14:10:45", user: "ADMIN", action: "Finished 3D chassis design model." }
    ]
  },
  {
    id: "robotic-arm",
    name: "ROBOTIC ARM",
    description: "5-Axis articulated arm for laboratory micro-positioning, sorting, and precision assembly. Utilizing heavy-duty stepper motor drivers.",
    currentMilestoneIdx: 1, 
    milestones: ["CAD Design", "3D Printing", "Actuators Wiring", "Inverse Kinematics", "End-effector Test"],
    checklist: [],
    files: [
      { 
        id: "f3", 
        name: "inverse_kinematics_formulations.pdf", 
        category: "pdf", 
        size: "890 KB", 
        date: "2026-06-23", 
        url: "#", 
        isLocal: false,
        dataUrl: "" 
      },
      { 
        id: "f4", 
        name: "joint_assembly_view.jpg", 
        category: "image", 
        size: "620 KB", 
        date: "2026-06-24", 
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop", 
        isLocal: false,
        dataUrl: "" 
      }
    ],
    parts: [
      { id: "p5", name: "NEMA 17 Stepper Motors", qty: 5, cost: 14.00, status: "Arrived" },
      { id: "p6", name: "TMC2209 Stepper Drivers", qty: 5, cost: 8.50, status: "Ordered" },
      { id: "p7", name: "Carbon Fiber PLA Filament 1kg", qty: 2, cost: 35.00, status: "Arrived" },
      { id: "p8", name: "Micro Gripper Servo Motor", qty: 1, cost: 11.20, status: "Pending" }
    ],
    changelog: [
      { id: "ch4", timestamp: "2026-06-26 14:02:11", user: "ADMIN", action: "Finished print of Joint 2 arm link." },
      { id: "ch5", timestamp: "2026-06-26 15:33:40", user: "ADMIN", action: "Added NEMA 17 steppers to the bill of materials." }
    ]
  },
  {
    id: "plastic-remover",
    name: "PLASTIC REMOVING MACHINE",
    description: "All-terrain autonomous mobile robot equipped with a rotary sweeper drum and AI camera to collect plastic trash from field grounds.",
    currentMilestoneIdx: 0, 
    milestones: ["Locomotion Setup", "Sweeper Mechanism", "Vision Model Training", "Integration Build", "Field Testing"],
    checklist: [],
    files: [
      { 
        id: "f5", 
        name: "yolov8_model_specifications.pdf", 
        category: "pdf", 
        size: "3.2 MB", 
        date: "2026-06-21", 
        url: "#", 
        isLocal: false,
        dataUrl: "" 
      },
      { 
        id: "f6", 
        name: "tread_chassis_mockup.jpg", 
        category: "image", 
        size: "1.1 MB", 
        date: "2026-06-22", 
        url: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=600&auto=format&fit=crop", 
        isLocal: false,
        dataUrl: "" 
      }
    ],
    parts: [
      { id: "p9", name: "Aluminum Tank Chassis Kit", qty: 1, cost: 110.00, status: "Arrived" },
      { id: "p10", name: "High Torque Sweeper Motor 12V", qty: 1, cost: 18.20, status: "Arrived" },
      { id: "p11", name: "Jetson Nano Developer Kit", qty: 1, cost: 149.00, status: "Pending" },
      { id: "p12", name: "USB Wide Angle Camera module", qty: 1, cost: 25.00, status: "Arrived" }
    ],
    changelog: [
      { id: "ch6", timestamp: "2026-06-26 09:30:12", user: "ADMIN", action: "Assembled tank tracks and connected DC motors." },
      { id: "ch7", timestamp: "2026-06-26 11:24:55", user: "ADMIN", action: "Tested 12V sweeper motor torque outputs." }
    ]
  }
];

class RoboApp {
  constructor() {
    this.projects = [];
    this.activeProjectId = "";
    this.currentRole = "ADMINISTRATOR"; 
    this.theme = "dark";
    this.viewer = null;
    
    this.uploadedFileDataUrl = "";
    this.uploadedFileName = "";

    this.init();
  }

  init() {
    this.loadState();

    // Shield setup against basic setup errors in HTML
    try {
      this.viewer = new RoboViewer('canvas-container', 'model-coords');
    } catch(e) {
      console.warn("3D Engine canvas framework offline or unallocated. Continuing UI engine execution.");
    }

    this.renderProjectList();
    this.switchProject(this.activeProjectId);
    this.applyTheme();
    this.applyRoleUI();
    this.bindEvents();
  }

  loadState() {
    const savedProjects = localStorage.getItem('robo_projects');
    const hasBootedV3 = localStorage.getItem('robo_boot_v3') === 'true';

    if (savedProjects && hasBootedV3) {
      try {
        this.projects = JSON.parse(savedProjects);
      } catch (e) {
        this.projects = SEED_PROJECTS;
      }
    } else {
      this.projects = SEED_PROJECTS;
      localStorage.setItem('robo_boot_v3', 'true');
      this.saveState();
    }

    const savedActiveId = localStorage.getItem('robo_active_project_id');
    if (savedActiveId && this.projects.some(p => p.id === savedActiveId)) {
      this.activeProjectId = savedActiveId;
    } else {
      this.activeProjectId = this.projects[0]?.id || "";
    }

    this.currentRole = localStorage.getItem('robo_role') || "ADMINISTRATOR";
    this.theme = localStorage.getItem('robo_theme') || "dark";
  }

  saveState() {
    localStorage.setItem('robo_projects', JSON.stringify(this.projects));
    localStorage.setItem('robo_active_project_id', this.activeProjectId);
    localStorage.setItem('robo_role', this.currentRole);
    localStorage.setItem('robo_theme', this.theme);
  }

  getActiveProject() {
    return this.projects.find(p => p.id === this.activeProjectId);
  }

  logChange(projectId, actionText) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    project.changelog.unshift({
      id: "ch_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      timestamp: timestamp,
      user: this.currentRole === "ADMINISTRATOR" ? "ADMIN" : "PARTNER",
      action: actionText
    });

    this.saveState();
    this.renderChangelog();
  }

  renderProjectList() {
    const listContainer = document.getElementById('project-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    this.projects.forEach(project => {
      const li = document.createElement('li');
      if (project.id === this.activeProjectId) {
        li.classList.add('active');
      }

      const totalTasks = project.checklist.length;
      const checkedTasks = project.checklist.filter(c => c.checked).length;

      const btn = document.createElement('button');
      btn.innerHTML = `
        <span>${project.name}</span>
        <span class="task-count">${checkedTasks}/${totalTasks} OK</span>
      `;
      
      btn.addEventListener('click', () => {
        this.switchProject(project.id);
      });

      li.appendChild(btn);
      listContainer.appendChild(li);
    });
  }

  switchProject(projectId) {
    if (!projectId) return;
    this.activeProjectId = projectId;
    localStorage.setItem('robo_active_project_id', projectId);

    const listItems = document.querySelectorAll('#project-list li');
    this.projects.forEach((proj, idx) => {
      if (proj.id === projectId) {
        listItems[idx]?.classList.add('active');
      } else {
        listItems[idx]?.classList.remove('active');
      }
    });

    const project = this.getActiveProject();
    if (!project) return;

    const nameEl = document.getElementById('active-project-name');
    if (nameEl) nameEl.innerText = project.name;

    this.renderMilestones();
    this.renderChecklist();
    this.renderFiles();
    this.renderParts();
    this.renderChangelog();

    if (this.viewer && typeof this.viewer.loadModel === 'function') {
      this.viewer.loadModel(project.name);
    }
  }

  calculateProgress(project) {
    if (!project) return 0;
    const milestonesCount = project.milestones.length;
    const milestoneProgress = milestonesCount > 1 
      ? (project.currentMilestoneIdx / (milestonesCount - 1)) * 50 
      : 0;

    const totalChecklist = project.checklist.length;
    const checkedChecklist = project.checklist.filter(c => c.checked).length;
    const checklistProgress = totalChecklist > 0 
      ? (checkedChecklist / totalChecklist) * 50 
      : 0;

    return Math.min(100, Math.max(0, Math.round(milestoneProgress + checklistProgress)));
  }

  renderMilestones() {
    const project = this.getActiveProject();
    const container = document.getElementById('workflow-bar');
    const textPercent = document.getElementById('overall-progress-text');
    if (!container) return;

    container.innerHTML = '';
    const progressPercent = this.calculateProgress(project);
    if (textPercent) textPercent.innerText = `${progressPercent}% COMPLETED`;

    const fill = document.createElement('div');
    fill.classList.add('progression-progress-fill');
    
    const nodeCount = project.milestones.length;
    const percentFillWidth = nodeCount > 1 ? (project.currentMilestoneIdx / (nodeCount - 1)) * 100 : 0;
    fill.style.width = `${percentFillWidth}%`;
    container.appendChild(fill);

    project.milestones.forEach((milestone, idx) => {
      const node = document.createElement('div');
      node.classList.add('progression-node');
      
      if (idx < project.currentMilestoneIdx) node.classList.add('completed');
      else if (idx === project.currentMilestoneIdx) node.classList.add('active');

      node.innerHTML = `
        <div class="node-dot"></div>
        <div class="node-label">${milestone}</div>
      `;

      node.addEventListener('click', () => {
        if (this.currentRole !== 'ADMINISTRATOR') {
          this.alertRestricted("Milestone structural updates require Admin Control clearances.");
          return;
        }
        project.currentMilestoneIdx = idx;
        this.logChange(project.id, `Advanced project milestone stage to "${milestone}".`);
        this.saveState();
        this.renderMilestones();
      });

      container.appendChild(node);
    });
  }

  renderChecklist() {
    const project = this.getActiveProject();
    const container = document.getElementById('checklist-container');
    const ratioBadge = document.getElementById('checklist-ratio');
    if (!container) return;

    container.innerHTML = '';
    const total = project.checklist.length;
    const checked = project.checklist.filter(c => c.checked).length;
    if (ratioBadge) ratioBadge.innerText = `${checked}/${total}`;

    project.checklist.forEach(item => {
      const li = document.createElement('li');
      li.className = `checklist-item ${item.checked ? 'checked' : ''}`;

      li.innerHTML = `
        <label class="checkbox-container">
          <input type="checkbox" ${item.checked ? 'checked' : ''} ${this.currentRole === 'PARTNER' ? 'disabled' : ''}>
          <span class="checkbox-checkmark"></span>
          <span class="task-text-span">${item.text}</span>
        </label>
        ${this.currentRole === 'ADMINISTRATOR' ? `<button class="btn-delete-task" data-id="${item.id}">&times;</button>` : ''}
      `;

      li.querySelector('input').addEventListener('change', (e) => {
        if (this.currentRole !== 'ADMINISTRATOR') return;
        item.checked = e.target.checked;
        this.logChange(project.id, `${e.target.checked ? 'Completed' : 'Reopened'} checklist item: "${item.text}".`);
        this.saveState();
        this.renderChecklist();
        this.renderMilestones();
        this.renderProjectList();
      });

      const deleteBtn = li.querySelector('.btn-delete-task');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          project.checklist = project.checklist.filter(c => c.id !== item.id);
          this.logChange(project.id, `Deleted checklist item: "${item.text}".`);
          this.saveState();
          this.renderChecklist();
          this.renderMilestones();
          this.renderProjectList();
        });
      }

      container.appendChild(li);
    });
  }

  renderFiles() {
    const project = this.getActiveProject();
    const container = document.getElementById('files-container');
    if (!container) return;
    container.innerHTML = '';

    if (project.files.length === 0) {
      container.innerHTML = `<div class="text-mute text-center text-xs w-100 py-4">No documents attached to this project yet.</div>`;
      return;
    }

    project.files.forEach(file => {
      const card = document.createElement('div');
      card.className = 'file-card';

      let icon = '📁';
      if (file.category === 'pdf') icon = '📄';
      if (file.category === 'image') icon = '🖼️';
      if (file.category === 'model') icon = '⚙️';

      let thumbHtml = '';
      if (file.category === 'image') {
        const bgSource = file.dataUrl ? file.dataUrl : file.url;
        thumbHtml = `<div class="file-preview-thumb" style="background-image: url('${bgSource}')"></div>`;
      } else if (file.category === 'pdf') {
        thumbHtml = `<div class="file-preview-thumb" style="display:flex; align-items:center; justify-content:center; background-color:#1e1e1e; color:#a3a3a3; font-size:10px; font-weight:bold;">PDF</div>`;
      }

      card.innerHTML = `
        <div class="file-header-info">
          ${thumbHtml}
          <div class="file-icon-badge">${thumbHtml ? '' : icon}</div>
          <div class="file-details">
            <h4 class="file-title" title="${file.name}">${file.name}</h4>
            <div class="file-info">
              <span class="badge text-xs">${file.category.toUpperCase()}</span>
              <span>${file.size}</span>
            </div>
          </div>
        </div>
        <div class="file-actions">
          <button class="btn btn-secondary btn-xs btn-view-file">PREVIEW</button>
          <button class="btn btn-secondary btn-xs btn-download-file">DOWNLOAD</button>
          ${this.currentRole === 'ADMINISTRATOR' ? `<button class="btn btn-secondary btn-xs btn-delete-file">&times; DELETE</button>` : ''}
        </div>
      `;

      card.querySelector('.btn-view-file').addEventListener('click', () => this.openFilePreview(file));

      card.querySelector('.btn-download-file').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = file.dataUrl ? file.dataUrl : file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      const delBtn = card.querySelector('.btn-delete-file');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          project.files = project.files.filter(f => f.id !== file.id);
          this.logChange(project.id, `Removed document file: "${file.name}".`);
          this.saveState();
          this.renderFiles();
        });
      }

      container.appendChild(card);
    });
  }

  openFilePreview(file) {
    const modal = document.getElementById('preview-modal');
    const title = document.getElementById('preview-title');
    const body = document.getElementById('preview-body');
    if (!modal || !body) return;

    if (title) title.innerText = file.name;
    body.innerHTML = '';

    const source = file.dataUrl ? file.dataUrl : file.url;

    if (file.category === 'image') {
      const img = document.createElement('img');
      img.src = source;
      img.className = 'preview-img';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '70vh';
      body.appendChild(img);
    } else if (file.category === 'pdf') {
      if (file.dataUrl) {
        const embed = document.createElement('embed');
        embed.src = file.dataUrl;
        embed.type = 'application/pdf';
        embed.className = 'preview-iframe';
        embed.style.width = '100%';
        embed.style.height = '60vh';
        body.appendChild(embed);
      } else {
        body.innerHTML = `
          <div style="padding: 40px; text-align:center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
            <h3>Simulated Document: ${file.name}</h3>
            <p class="text-sm text-mute mt-2">Local server mock layer active.</p>
          </div>
        `;
      }
    } else {
      body.innerHTML = `
        <div style="padding: 40px; text-align:center;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚙️</div>
          <h3>Binary Assets: ${file.name}</h3>
        </div>
      `;
    }
    modal.classList.add('show');
  }

  renderParts() {
    const project = this.getActiveProject();
    const container = document.getElementById('parts-container');
    const costTotalDisplay = document.getElementById('parts-cost-total');
    if (!container) return;

    container.innerHTML = '';
    let totalCost = 0;

    project.parts.forEach(part => {
      const partTotal = part.qty * part.cost;
      totalCost += partTotal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-monospace">${part.name}</td>
        <td>${part.qty}</td>
        <td>$${part.cost.toFixed(2)}</td>
        <td>
          <span class="part-status-badge status-${part.status.toLowerCase()}">${part.status}</span>
        </td>
        <td>
          ${this.currentRole === 'ADMINISTRATOR' ? `<button class="btn btn-secondary btn-xs btn-delete-part">REMOVE</button>` : '—'}
        </td>
      `;

      const badge = tr.querySelector('.part-status-badge');
      badge.addEventListener('click', () => {
        if (this.currentRole !== 'ADMINISTRATOR') return;
        const states = ["Pending", "Ordered", "Arrived"];
        const currentIdx = states.indexOf(part.status);
        part.status = states[(currentIdx + 1) % states.length];
        this.logChange(project.id, `Updated part status: "${part.name}" -> ${part.status}.`);
        this.saveState();
        this.renderParts();
      });

      const delBtn = tr.querySelector('.btn-delete-part');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          project.parts = project.parts.filter(p => p.id !== part.id);
          this.logChange(project.id, `Removed component part: "${part.name}".`);
          this.saveState();
          this.renderParts();
        });
      }

      container.appendChild(tr);
    });

    if (costTotalDisplay) costTotalDisplay.innerText = `TOTAL: $${totalCost.toFixed(2)}`;
  }

  renderChangelog() {
    const project = this.getActiveProject();
    const container = document.getElementById('changelog-container');
    if (!container) return;
    container.innerHTML = '';

    if (project.changelog.length === 0) {
      container.innerHTML = `<li class="text-mute text-xs text-center py-4">Timeline log is empty.</li>`;
      return;
    }

    project.changelog.forEach(log => {
      const li = document.createElement('li');
      li.className = 'timeline-item';
      li.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-time">
            <span class="timeline-user">[${log.user}]</span> @ ${log.timestamp}
          </div>
          <div class="timeline-message">${log.action}</div>
        </div>
      `;
      container.appendChild(li);
    });
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    if (this.viewer && typeof this.viewer.updateMaterials === 'function') {
      this.viewer.updateMaterials(this.theme);
    }
  }

  applyRoleUI() {
    const badge = document.getElementById('partner-badge');
    const roleDisplay = document.getElementById('current-role-display');
    const badgeIcon = document.getElementById('role-badge-icon');
    const container = document.querySelector('.main-content');
    const adminForms = document.querySelectorAll('.admin-only-form, #form-add-task, #form-add-part, #form-upload-file');
    
    if (roleDisplay) roleDisplay.innerText = this.currentRole;
    
    if (this.currentRole === 'PARTNER') {
      if (badge) {
        badge.innerText = 'PARTNER REVIEW // READ ONLY';
        badge.classList.add('partner-mode');
      }
      if (badgeIcon) badgeIcon.innerText = '👁️';
      if (container) container.classList.add('partner-locked');
      document.body.classList.add('partner-mode-active');
      
      // Hide or disable operational inputs for pure review profiles
      adminForms.forEach(form => form.style.opacity = '0.5');
    } else {
      if (badge) {
        badge.innerText = 'ADMIN CONTROL';
        badge.classList.remove('partner-mode');
      }
      if (badgeIcon) badgeIcon.innerText = '🔓';
      if (container) container.classList.remove('partner-locked');
      document.body.classList.remove('partner-mode-active');
      
      adminForms.forEach(form => form.style.opacity = '1');
    }

    this.renderChecklist();
    this.renderFiles();
    this.renderParts();
  }

  alertRestricted(msg) {
    alert(`🔒 ACCESS DENIED // READ-ONLY MODE:\n\n${msg}\n\nSwitch user profile settings via the bottom action command deck.`);
  }

  bindEvents() {
    // Theme Toggle Setup
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.saveState();
        this.applyTheme();
      });
    }

    // Add Task Handler
    const addTaskForm = document.getElementById('form-add-task');
    if (addTaskForm) {
      addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.currentRole !== 'ADMINISTRATOR') {
          this.alertRestricted("Task deployments restricted to Administrator clearances.");
          return;
        }
        const input = document.getElementById('input-task-text');
        const proj = this.getActiveProject();
        if (input && input.value.trim() && proj) {
          const text = input.value.trim();
          proj.checklist.push({ id: "c_" + Date.now(), text: text, checked: false });
          this.logChange(proj.id, `Added new checklist item: "${text}".`);
          this.saveState();
          this.renderChecklist();
          this.renderMilestones();
          this.renderProjectList();
          input.value = '';
        }
      });
    }

    // Add Component Part Handler
    const addPartForm = document.getElementById('form-add-part');
    if (addPartForm) {
      addPartForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.currentRole !== 'ADMINISTRATOR') {
          this.alertRestricted("Inventory logging pipeline restricted in Partner mode.");
          return;
        }

        const nameInput = document.getElementById('input-part-name');
        const qtyInput = document.getElementById('input-part-qty');
        const costInput = document.getElementById('input-part-cost');
        const statusSelect = document.getElementById('input-part-status');
        const proj = this.getActiveProject();

        if (nameInput && nameInput.value.trim() && proj) {
          const name = nameInput.value.trim();
          const qty = parseInt(qtyInput?.value || '1', 10);
          const cost = parseFloat(costInput?.value || '0.00');
          const status = statusSelect?.value || 'Pending';

          proj.parts.push({ id: "p_" + Date.now(), name, qty, cost, status });
          this.logChange(proj.id, `Registered part: "${name}" x${qty} ($${cost.toFixed(2)} ea).`);
          
          this.saveState();
          this.renderParts();

          if (nameInput) nameInput.value = '';
          if (qtyInput) qtyInput.value = '1';
          if (costInput) costInput.value = '0.00';
          if (statusSelect) statusSelect.value = 'Pending';
        }
      });
    }

    // File Selection Logic
    const fileSelectorDummy = document.getElementById('btn-file-select');
    const fileInputHidden = document.getElementById('input-file-upload');
    const fileLabelDisplay = document.getElementById('selected-file-label');

    if (fileSelectorDummy && fileInputHidden) {
      fileSelectorDummy.addEventListener('click', () => {
        if (this.currentRole !== 'ADMINISTRATOR') {
          this.alertRestricted("Upload sequences are locked under Partner profile configurations.");
          return;
        }
        fileInputHidden.click();
      });
    }

    if (fileInputHidden) {
      fileInputHidden.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1572864) {
          alert("⚠️ LOCAL CACHE OVERLOAD PROTECT:\nFile size caps at 1.5MB for secure LocalStorage transactions.");
          fileInputHidden.value = '';
          if (fileLabelDisplay) fileLabelDisplay.innerText = "No file chosen";
          return;
        }

        this.uploadedFileName = file.name;
        if (fileLabelDisplay) fileLabelDisplay.innerText = file.name;

        const reader = new FileReader();
        reader.onload = (evt) => { this.uploadedFileDataUrl = evt.target.result; };
        reader.readAsDataURL(file);
      });
    }

    // File Upload Submission Form
    const uploadFileForm = document.getElementById('form-upload-file');
    if (uploadFileForm) {
      uploadFileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.currentRole !== 'ADMINISTRATOR') {
          this.alertRestricted("Document uploads require administrator structural access level.");
          return;
        }

        const proj = this.getActiveProject();
        const fileTitleInput = document.getElementById('input-file-name');
        const categorySelect = document.getElementById('input-file-type');
        const externalUrlInput = document.getElementById('input-file-url');

        if (!proj || !fileTitleInput) return;

        const title = fileTitleInput.value.trim();
        const category = categorySelect?.value || 'pdf';
        const extUrl = externalUrlInput?.value.trim() || '';

        if (!title) {
          alert("Please input a valid name for the file block configuration.");
          return;
        }

        let size = "100 KB";
        let sourceUrl = "#";
        let dataUrlToSave = "";
        
        if (this.uploadedFileDataUrl) {
          const fileObj = fileInputHidden?.files[0];
          if (fileObj) {
            const sizeKb = Math.round(fileObj.size / 1024);
            size = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + " MB" : sizeKb + " KB";
          }
          dataUrlToSave = this.uploadedFileDataUrl;
          sourceUrl = "";
        } else if (extUrl) {
          sourceUrl = extUrl;
          size = "External URL Link";
        } else {
          alert("Map a local asset file via file selector browser or input external source link URI.");
          return;
        }

        proj.files.push({
          id: "f_" + Date.now(),
          name: title,
          category: category,
          size: size,
          date: new Date().toISOString().substring(0, 10),
          url: sourceUrl,
          isLocal: !!this.uploadedFileDataUrl,
          dataUrl: dataUrlToSave
        });

        this.logChange(proj.id, `Uploaded document: "${title}" (${category.toUpperCase()}).`);
        this.saveState();
        this.renderFiles();

        fileTitleInput.value = '';
        if (categorySelect) categorySelect.value = 'pdf';
        if (externalUrlInput) externalUrlInput.value = '';
        if (fileInputHidden) fileInputHidden.value = '';
        if (fileLabelDisplay) fileLabelDisplay.innerText = "No file chosen";
        this.uploadedFileDataUrl = "";
        this.uploadedFileName = "";
      });
    }

    // Modal Opening and Closing Layout Systems
    const loginModal = document.getElementById('login-modal');
    const loginError = document.getElementById('login-error-msg');

    const triggerLoginModal = () => {
      const uField = document.getElementById('login-username');
      const pField = document.getElementById('login-password');
      if (uField) uField.value = '';
      if (pField) pField.value = '';
      if (loginError) loginError.style.display = 'none';
      if (loginModal) loginModal.classList.add('show');
    };

    const toggleBtn = document.getElementById('btn-toggle-login');
    if (toggleBtn) toggleBtn.addEventListener('click', triggerLoginModal);
    
    const partnerBadge = document.getElementById('partner-badge');
    if (partnerBadge) partnerBadge.addEventListener('click', triggerLoginModal);

    const closeLoginPanel = () => {
      if (loginModal) loginModal.classList.remove('show');
    };

    const closeLoginBtn = document.getElementById('btn-close-modal');
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLoginPanel);

    const cancelLoginBtn = document.getElementById('btn-cancel-login');
    if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', closeLoginPanel);

    // Dynamic verification layer authentication system code execution
    const loginForm = document.getElementById('form-login-auth');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userVal = document.getElementById('login-username')?.value.trim();
        const passVal = document.getElementById('login-password')?.value.trim();
        
        let targetRole = "";
        // Accepting fallback keys provided in baseline setup logs
        if (userVal === "admin1234" && (passVal === "12345678" || passVal === "as12345678")) {
          targetRole = "ADMINISTRATOR";
        } else if (userVal === "partner1234" && (passVal === "12345678" || passVal === "as12345678")) {
          targetRole = "PARTNER";
        }
        
        if (targetRole !== "") {
          if (loginError) loginError.style.display = 'none';
          const previousRole = this.currentRole;
          this.currentRole = targetRole;
          this.saveState();
          this.applyRoleUI();
          
          if (previousRole !== this.currentRole) {
            const proj = this.getActiveProject();
            if (proj) this.logChange(proj.id, `User authenticated signature update: ${previousRole} -> ${targetRole}.`);
          }
          closeLoginPanel();
        } else {
          if (loginError) loginError.style.display = 'block';
        }
      });
    }

    // Modal UI Closing Layer Helpers (Clicking background close element overlays)
    window.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        closeLoginPanel();
      }
      const previewModal = document.getElementById('preview-modal');
      if (e.target === previewModal) {
        previewModal.classList.remove('show');
      }
    });

    const closePreviewBtn = document.getElementById('btn-close-preview');
    if (closePreviewBtn) {
      closePreviewBtn.addEventListener('click', () => {
        const previewModal = document.getElementById('preview-modal');
        if (previewModal) previewModal.classList.remove('show');
      });
    }

    // Reset workflow milestones
    const resetWfBtn = document.getElementById('btn-reset-workflow');
    if (resetWfBtn) {
      resetWfBtn.addEventListener('click', () => {
        if (this.currentRole !== 'ADMINISTRATOR') return;
        const proj = this.getActiveProject();
        if (proj) {
          proj.currentMilestoneIdx = 0;
          this.logChange(proj.id, "Reset workflow milestones to initial Concept stage.");
          this.saveState();
          this.renderMilestones();
        }
      });
    }

    // Clear tracking dashboard log entries 
    const clearChangelogBtn = document.getElementById('btn-clear-changelog');
    if (clearChangelogBtn) {
      clearChangelogBtn.addEventListener('click', () => {
        const proj = this.getActiveProject();
        if (!proj) return;
        if (confirm(`Are you sure you want to clear the changelog timeline for ${proj.name}?`)) {
          proj.changelog = [];
          this.saveState();
          this.renderChangelog();
        }
      });
    }

    // Partner feedback node tracking forms hook
    const partnerNoteForm = document.getElementById('form-partner-note');
    if (partnerNoteForm) {
      partnerNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.currentRole !== 'PARTNER') {
          alert("Only partners can submit feedback reviews.");
          return;
        }
        const input = document.getElementById('input-partner-note');
        const proj = this.getActiveProject();
        if (input && input.value.trim() && proj) {
          this.logChange(proj.id, `Feedback left: "${input.value.trim()}"`);
          input.value = '';
        }
      });
    }
  }
}

// Instantiate on Core Web Content Initialization Match
window.addEventListener('DOMContentLoaded', () => {
  new RoboApp();
});