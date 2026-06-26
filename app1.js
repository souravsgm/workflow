/**
 * ==========================================================================
 * ROBO_SYSTEMS CORE APPLICATION & STATE MANAGEMENT
 * ==========================================================================
 */

import { RoboViewer } from './viewer3d.js';

// Initial projects structure (seeded if no localStorage is present)
const SEED_PROJECTS = [
  {
    id: "communication-robot",
    name: "COMMUNICATION ROBOT",
    description: "Sleek hovering assistant robot with built-in voice processing and visual display. Designed for question-answering and communication in lab environments.",
    currentMilestoneIdx: 1, // "3D Printing"
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
    currentMilestoneIdx: 1, // "3D Printing"
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
    currentMilestoneIdx: 0, // "Locomotion"
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

// App State Core
class RoboApp {
  constructor() {
    this.projects = [];
    this.activeProjectId = "";
    this.currentRole = "ADMINISTRATOR"; // ADMINISTRATOR or PARTNER
    this.theme = "dark";
    this.viewer = null;
    
    // File upload cache
    this.uploadedFileDataUrl = "";
    this.uploadedFileName = "";

    this.init();
  }

  init() {
    // 1. Load data from LocalStorage or initialize with SEED
    this.loadState();

    // 2. Initialize 3D Viewer
    this.viewer = new RoboViewer('canvas-container', 'model-coords');

    // 3. Render initial views
    this.renderProjectList();
    this.switchProject(this.activeProjectId);
    this.applyTheme();
    this.applyRoleUI();

    // 4. Bind listeners
    this.bindEvents();
  }

  // Load from localStorage
  loadState() {
    const savedProjects = localStorage.getItem('robo_projects');
    const hasBootedV3 = localStorage.getItem('robo_boot_v3') === 'true';

    if (savedProjects && hasBootedV3) {
      try {
        this.projects = JSON.parse(savedProjects);
      } catch (e) {
        console.error("Failed to parse saved projects, resetting seed.", e);
        this.projects = SEED_PROJECTS;
      }
    } else {
      // Clean start for clean checklists and new credentials
      this.projects = SEED_PROJECTS;
      localStorage.setItem('robo_boot_v3', 'true');
      this.saveState();
    }

    const savedActiveId = localStorage.getItem('robo_active_project_id');
    if (savedActiveId && this.projects.some(p => p.id === savedActiveId)) {
      this.activeProjectId = savedActiveId;
    } else {
      this.activeProjectId = this.projects[0].id;
    }

    const savedRole = localStorage.getItem('robo_role');
    if (savedRole) {
      this.currentRole = savedRole;
    }

    const savedTheme = localStorage.getItem('robo_theme');
    if (savedTheme) {
      this.theme = savedTheme;
    }
  }

  // Save to localStorage
  saveState() {
    localStorage.setItem('robo_projects', JSON.stringify(this.projects));
    localStorage.setItem('robo_active_project_id', this.activeProjectId);
    localStorage.setItem('robo_role', this.currentRole);
    localStorage.setItem('robo_theme', this.theme);
  }

  getActiveProject() {
    return this.projects.find(p => p.id === this.activeProjectId);
  }

  // Add event to changelog
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

  // Render project lists in sidebar
  renderProjectList() {
    const listContainer = document.getElementById('project-list');
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

  // Switch project
  switchProject(projectId) {
    this.activeProjectId = projectId;
    localStorage.setItem('robo_active_project_id', projectId);

    // Update active highlight in sidebar
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

    // Update UI headers
    document.getElementById('active-project-name').innerText = project.name;

    // Render widgets
    this.renderMilestones();
    this.renderChecklist();
    this.renderFiles();
    this.renderParts();
    this.renderChangelog();

    // Trigger 3D viewer model swap
    if (this.viewer) {
      this.viewer.loadModel(project.name);
    }
  }

  // Calculate project completion percent
  calculateProgress(project) {
    if (!project) return 0;
    
    // Milestones completion weight (50%)
    const milestonesCount = project.milestones.length;
    const milestoneProgress = milestonesCount > 1 
      ? (project.currentMilestoneIdx / (milestonesCount - 1)) * 50 
      : 0;

    // Checklist completion weight (50%)
    const totalChecklist = project.checklist.length;
    const checkedChecklist = project.checklist.filter(c => c.checked).length;
    const checklistProgress = totalChecklist > 0 
      ? (checkedChecklist / totalChecklist) * 50 
      : 0;

    const total = Math.round(milestoneProgress + checklistProgress);
    return Math.min(100, Math.max(0, total));
  }

  // Render Milestones/Progress tracker
  renderMilestones() {
    const project = this.getActiveProject();
    const container = document.getElementById('workflow-bar');
    const textPercent = document.getElementById('overall-progress-text');
    
    container.innerHTML = '';

    const progressPercent = this.calculateProgress(project);
    textPercent.innerText = `${progressPercent}% COMPLETED`;

    // Fill line
    const fill = document.createElement('div');
    fill.classList.add('progression-progress-fill');
    
    // Calculate width relative to node count
    const nodeCount = project.milestones.length;
    const percentFillWidth = nodeCount > 1 
      ? (project.currentMilestoneIdx / (nodeCount - 1)) * 100 
      : 0;
    fill.style.width = `${percentFillWidth}%`;
    container.appendChild(fill);

    // Nodes
    project.milestones.forEach((milestone, idx) => {
      const node = document.createElement('div');
      node.classList.add('progression-node');
      
      if (idx < project.currentMilestoneIdx) {
        node.classList.add('completed');
      } else if (idx === project.currentMilestoneIdx) {
        node.classList.add('active');
      }

      node.innerHTML = `
        <div class="node-dot"></div>
        <div class="node-label">${milestone}</div>
      `;

      // Click event for milestones (restricted to Admin)
      node.addEventListener('click', () => {
        if (this.currentRole !== 'ADMINISTRATOR') {
          this.alertRestricted("Milestone selection is locked in Partner mode.");
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

  // Render Project Checklist
  renderChecklist() {
    const project = this.getActiveProject();
    const container = document.getElementById('checklist-container');
    const ratioBadge = document.getElementById('checklist-ratio');

    container.innerHTML = '';

    const total = project.checklist.length;
    const checked = project.checklist.filter(c => c.checked).length;
    ratioBadge.innerText = `${checked}/${total}`;

    project.checklist.forEach(item => {
      const li = document.createElement('li');
      li.className = `checklist-item ${item.checked ? 'checked' : ''}`;

      li.innerHTML = `
        <label class="checkbox-container">
          <input type="checkbox" ${item.checked ? 'checked' : ''} ${this.currentRole === 'PARTNER' ? 'disabled' : ''}>
          <span class="checkbox-checkmark"></span>
          ${item.text}
        </label>
        ${this.currentRole === 'ADMINISTRATOR' ? `<button class="btn-delete-task" data-id="${item.id}">&times;</button>` : ''}
      `;

      // Listen to checkbox toggles
      const input = li.querySelector('input');
      input.addEventListener('change', (e) => {
        if (this.currentRole !== 'ADMINISTRATOR') return;
        
        item.checked = e.target.checked;
        this.logChange(project.id, `${e.target.checked ? 'Completed' : 'Reopened'} checklist item: "${item.text}".`);
        this.saveState();
        this.renderChecklist();
        this.renderMilestones();
        this.renderProjectList();
      });

      // Listen to delete clicks
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

  // Render Files Hub
  renderFiles() {
    const project = this.getActiveProject();
    const container = document.getElementById('files-container');
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

      // Visual Thumbnail for images
      let thumbHtml = '';
      if (file.category === 'image') {
        const bgSource = file.dataUrl ? file.dataUrl : file.url;
        thumbHtml = `<div class="file-preview-thumb" style="background-image: url('${bgSource}')"></div>`;
      } else if (file.category === 'pdf') {
        thumbHtml = `<div class="file-preview-thumb" style="display:flex; align-items:center; justify-content:center; background-color:#1e1e1e; color:#a3a3a3; font-size:10px; font-weight:bold; border-color:#2a2a2a;">PDF DOCUMENT</div>`;
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
          <button class="btn btn-secondary btn-xs btn-view-file" data-id="${file.id}">PREVIEW</button>
          <button class="btn btn-secondary btn-xs btn-download-file" data-id="${file.id}">DOWNLOAD</button>
          ${this.currentRole === 'ADMINISTRATOR' ? `<button class="btn btn-secondary btn-xs btn-delete-file" data-id="${file.id}">DELETE</button>` : ''}
        </div>
      `;

      // View File trigger
      card.querySelector('.btn-view-file').addEventListener('click', () => {
        this.openFilePreview(file);
      });

      // Download File trigger
      card.querySelector('.btn-download-file').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = file.dataUrl ? file.dataUrl : file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // Delete File trigger
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

  // Open Preview Modal
  openFilePreview(file) {
    const modal = document.getElementById('preview-modal');
    const title = document.getElementById('preview-title');
    const body = document.getElementById('preview-body');

    title.innerText = file.name;
    body.innerHTML = '';

    const source = file.dataUrl ? file.dataUrl : file.url;

    if (file.category === 'image') {
      const img = document.createElement('img');
      img.src = source;
      img.className = 'preview-img';
      body.appendChild(img);
    } else if (file.category === 'pdf') {
      if (file.dataUrl) {
        // Embed Base64 PDF
        const embed = document.createElement('embed');
        embed.src = file.dataUrl;
        embed.type = 'application/pdf';
        embed.className = 'preview-iframe';
        body.appendChild(embed);
      } else {
        // Fallback for seed
        body.innerHTML = `
          <div style="padding: 40px; background-color: var(--bg-tertiary); border: 1px dashed var(--border-color);">
            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
            <h3>Simulated Document: ${file.name}</h3>
            <p class="text-sm text-mute mt-2">PDF reader core active. In production, this renders the uploaded binary file directly.</p>
            <a href="#" class="btn btn-primary mt-3" onclick="event.preventDefault(); alert('Downloading file: ${file.name}');">DOWNLOAD SCHEMATICS</a>
          </div>
        `;
      }
    } else {
      body.innerHTML = `
        <div style="padding: 40px; background-color: var(--bg-tertiary); border: 1px dashed var(--border-color);">
          <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
          <h3>Binary Document: ${file.name}</h3>
          <p class="text-sm text-mute mt-2">File Format: ${file.category.toUpperCase()} | Size: ${file.size}</p>
          <a href="#" class="btn btn-primary mt-3" onclick="event.preventDefault(); alert('Downloading binary assets...');">DOWNLOAD ATTACHMENTS</a>
        </div>
      `;
    }

    modal.classList.add('show');
  }

  // Render Parts table
  renderParts() {
    const project = this.getActiveProject();
    const container = document.getElementById('parts-container');
    const costTotalDisplay = document.getElementById('parts-cost-total');

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
          <span class="part-status-badge status-${part.status}" data-id="${part.id}">${part.status}</span>
        </td>
        <td>
          ${this.currentRole === 'ADMINISTRATOR' ? `<button class="btn btn-secondary btn-xs btn-delete-part" data-id="${part.id}">REMOVE</button>` : '—'}
        </td>
      `;

      // Cycle Status Event (Admin Only)
      const badge = tr.querySelector('.part-status-badge');
      badge.addEventListener('click', () => {
        if (this.currentRole !== 'ADMINISTRATOR') return;
        
        const states = ["Pending", "Ordered", "Arrived"];
        const currentIdx = states.indexOf(part.status);
        const nextState = states[(currentIdx + 1) % states.length];
        
        part.status = nextState;
        this.logChange(project.id, `Updated part status: "${part.name}" -> ${nextState}.`);
        this.saveState();
        this.renderParts();
      });

      // Delete Part trigger
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

    costTotalDisplay.innerText = `TOTAL: $${totalCost.toFixed(2)}`;
  }

  // Render Changelog
  renderChangelog() {
    const project = this.getActiveProject();
    const container = document.getElementById('changelog-container');
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

  // Apply visual theme selection
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    
    // Notify 3D renderer of theme swap to update canvas scene backgrounds & grid
    if (this.viewer) {
      this.viewer.updateMaterials(this.theme);
    }
  }

  // Apply role styles and form locking
  applyRoleUI() {
    const badge = document.getElementById('partner-badge');
    const roleDisplay = document.getElementById('current-role-display');
    const badgeIcon = document.getElementById('role-badge-icon');
    const container = document.querySelector('.main-content');
    
    roleDisplay.innerText = this.currentRole;
    
    if (this.currentRole === 'PARTNER') {
      badge.innerText = 'PARTNER REVIEW // READ ONLY';
      badge.classList.add('partner-mode');
      badgeIcon.innerText = '👁️';
      container.classList.add('partner-locked');
      document.body.classList.add('partner-mode-active');
    } else {
      badge.innerText = 'ADMIN CONTROL';
      badge.classList.remove('partner-mode');
      badgeIcon.innerText = '🔓';
      container.classList.remove('partner-locked');
      document.body.classList.remove('partner-mode-active');
    }

    // Re-render checklist/files to dynamically hide action delete buttons or disable inputs
    const project = this.getActiveProject();
    if (project) {
      this.renderChecklist();
      this.renderFiles();
      this.renderParts();
    }
  }

  // Helper alert for locked items
  alertRestricted(msg) {
    alert(`🔒 ACCESS DENIED // READ-ONLY MODE:\n\n${msg}\n\nTo perform this action, please switch your role to ADMINISTRATOR using the bottom-left panel.`);
  }

  // Events Binding
  bindEvents() {
    const project = this.getActiveProject();

    // 1. Theme Toggle Click
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.saveState();
      this.applyTheme();
    });

    // 2. Add Task Form submit
    document.getElementById('form-add-task').addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.currentRole !== 'ADMINISTRATOR') {
        this.alertRestricted("Task additions are restricted in Partner mode.");
        return;
      }

      const input = document.getElementById('input-task-text');
      const text = input.value.trim();
      const proj = this.getActiveProject();

      if (text && proj) {
        proj.checklist.push({
          id: "c_" + Date.now(),
          text: text,
          checked: false
        });

        this.logChange(proj.id, `Added new checklist item: "${text}".`);
        this.saveState();
        this.renderChecklist();
        this.renderMilestones();
        this.renderProjectList();
        input.value = '';
      }
    });

    // 3. Add Part Form submit
    document.getElementById('form-add-part').addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.currentRole !== 'ADMINISTRATOR') {
        this.alertRestricted("Parts registrations are restricted in Partner mode.");
        return;
      }

      const nameInput = document.getElementById('input-part-name');
      const qtyInput = document.getElementById('input-part-qty');
      const costInput = document.getElementById('input-part-cost');
      const statusSelect = document.getElementById('input-part-status');

      const name = nameInput.value.trim();
      const qty = parseInt(qtyInput.value);
      const cost = parseFloat(costInput.value);
      const status = statusSelect.value;
      const proj = this.getActiveProject();

      if (name && proj) {
        proj.parts.push({
          id: "p_" + Date.now(),
          name: name,
          qty: qty,
          cost: cost,
          status: status
        });

        this.logChange(proj.id, `Registered part: "${name}" x${qty} ($${cost.toFixed(2)} ea, status: ${status}).`);
        this.saveState();
        this.renderParts();

        // Reset fields
        nameInput.value = '';
        qtyInput.value = '1';
        costInput.value = '0.00';
        statusSelect.value = 'Pending';
      }
    });

    // 4. File uploads & selector logic
    const fileSelectorDummy = document.getElementById('btn-file-select');
    const fileInputHidden = document.getElementById('input-file-upload');
    const fileLabelDisplay = document.getElementById('selected-file-label');

    fileSelectorDummy.addEventListener('click', () => {
      if (this.currentRole !== 'ADMINISTRATOR') {
        this.alertRestricted("File uploads are restricted in Partner mode.");
        return;
      }
      fileInputHidden.click();
    });

    fileInputHidden.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Restrict to ~1.5MB for localStorage safety
      if (file.size > 1572864) {
        alert("⚠️ FILE TOO LARGE:\n\nPlease select a file smaller than 1.5MB to ensure local client compatibility.");
        fileInputHidden.value = '';
        fileLabelDisplay.innerText = "No file chosen";
        return;
      }

      this.uploadedFileName = file.name;
      fileLabelDisplay.innerText = file.name;

      // Convert to Base64 dataUrl
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.uploadedFileDataUrl = evt.target.result;
      };
      reader.readAsDataURL(file);
    });

    // File Hub Upload Submit
    document.getElementById('form-upload-file').addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.currentRole !== 'ADMINISTRATOR') {
        this.alertRestricted("File uploads are restricted in Partner mode.");
        return;
      }

      const proj = this.getActiveProject();
      const fileTitleInput = document.getElementById('input-file-name');
      const categorySelect = document.getElementById('input-file-type');
      const externalUrlInput = document.getElementById('input-file-url');

      const title = fileTitleInput.value.trim();
      const category = categorySelect.value;
      const extUrl = externalUrlInput.value.trim();

      if (!proj) return;

      let size = "100 KB"; // Default mockup size
      let sourceUrl = "#";
      let dataUrlToSave = "";
      
      // Determine file source
      if (this.uploadedFileDataUrl) {
        // Read size from file input
        const fileObj = fileInputHidden.files[0];
        if (fileObj) {
          const sizeKb = Math.round(fileObj.size / 1024);
          size = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + " MB" : sizeKb + " KB";
        }
        dataUrlToSave = this.uploadedFileDataUrl;
        sourceUrl = "";
      } else if (extUrl) {
        sourceUrl = extUrl;
        size = "External Resource";
      } else {
        alert("Please browse a local file or enter an external URL to attach.");
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

      this.logChange(proj.id, `Uploaded document: "${title}" (${category.toUpperCase()}, size: ${size}).`);
      this.saveState();
      this.renderFiles();

      // Reset Form fields
      fileTitleInput.value = '';
      categorySelect.value = 'pdf';
      externalUrlInput.value = '';
      fileInputHidden.value = '';
      fileLabelDisplay.innerText = "No file chosen";
      this.uploadedFileDataUrl = "";
      this.uploadedFileName = "";
    });

    // 5. Secure Partner/Admin Login Modal
    const loginModal = document.getElementById('login-modal');
    const loginError = document.getElementById('login-error-msg');

    const triggerLoginModal = () => {
      document.getElementById('login-username').value = '';
      document.getElementById('login-password').value = '';
      loginError.style.display = 'none';
      loginModal.classList.add('show');
    };

    document.getElementById('btn-toggle-login').addEventListener('click', triggerLoginModal);
    document.getElementById('partner-badge').addEventListener('click', triggerLoginModal);

    const resetLoginInputs = () => {
      document.getElementById('login-username').value = '';
      document.getElementById('login-password').value = '';
      loginError.style.display = 'none';
      loginModal.classList.remove('show');
    };

    document.getElementById('btn-close-modal').addEventListener('click', resetLoginInputs);
    document.getElementById('btn-cancel-login').addEventListener('click', resetLoginInputs);

    // Confirm switch role using form submit
    document.getElementById('form-login-auth').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const userVal = document.getElementById('login-username').value.trim();
      const passVal = document.getElementById('login-password').value.trim();
      
      let targetRole = "";
      
      if (userVal === "admin1234" && (passVal === "12345678" || passVal === "as12345678")) {
        targetRole = "ADMINISTRATOR";
      } else if (userVal === "partner1234" && (passVal === "12345678" || passVal === "as12345678")) {
        targetRole = "PARTNER";
      }
      
      if (targetRole !== "") {
        loginError.style.display = 'none';
        
        const previousRole = this.currentRole;
        this.currentRole = targetRole;
        this.saveState();
        this.applyRoleUI();
        
        if (previousRole !== this.currentRole) {
          const proj = this.getActiveProject();
          if (proj) {
            this.logChange(proj.id, `User authenticated: ${previousRole} -> ${targetRole}.`);
          }
        }
        
        resetLoginInputs();
      } else {
        loginError.style.display = 'block';
      }
    });

    // 6. Preview Modal Close
    const previewModal = document.getElementById('preview-modal');
    document.getElementById('btn-close-preview').addEventListener('click', () => {
      previewModal.classList.remove('show');
    });

    // 7. Clear Changelog
    document.getElementById('btn-clear-changelog').addEventListener('click', () => {
      const proj = this.getActiveProject();
      if (!proj) return;

      if (confirm(`Are you sure you want to clear the changelog timeline for ${proj.name}?`)) {
        proj.changelog = [];
        this.saveState();
        this.renderChangelog();
      }
    });

    // 7.5 Reset Workflow Milestones
    document.getElementById('btn-reset-workflow').addEventListener('click', () => {
      if (this.currentRole !== 'ADMINISTRATOR') return;
      const proj = this.getActiveProject();
      if (proj) {
        proj.currentMilestoneIdx = 0;
        this.logChange(proj.id, "Reset workflow milestones to initial Concept stage.");
        this.saveState();
        this.renderMilestones();
      }
    });

    // 8. Partner Review Note Submit
    document.getElementById('form-partner-note').addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.currentRole !== 'PARTNER') {
        alert("Only partners can submit feedback reviews.");
        return;
      }

      const input = document.getElementById('input-partner-note');
      const text = input.value.trim();
      const proj = this.getActiveProject();

      if (text && proj) {
        this.logChange(proj.id, `Feedback left: "${text}"`);
        input.value = '';
      }
    });
  }
}

// Instantiate on Page Load
window.addEventListener('DOMContentLoaded', () => {
  new RoboApp();
});
