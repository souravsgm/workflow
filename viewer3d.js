/**
 * ==========================================================================
 * ROBO_SYSTEMS INTERACTIVE 3D WIREFRAME VIEWER (Three.js)
 * ==========================================================================
 */

export class RoboViewer {
  constructor(containerId, coordsDisplayId) {
    this.container = document.getElementById(containerId);
    this.coordsDisplay = document.getElementById(coordsDisplayId);
    
    if (!this.container) {
      console.error("3D Canvas container not found.");
      return;
    }

    this.isMock = (typeof THREE === 'undefined');
    
    if (this.isMock) {
      console.warn("Three.js not loaded. Falling back to 2D Canvas Mockup.");
      this.initMock();
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.modelGroup = null;
    
    // Interaction state
    this.isDragging = false;
    this.dragMode = 'rotate'; // 'rotate' (left click), 'pan' (right click)
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationSpeed = 0.005;
    this.panSpeed = 0.01;
    this.zoomSpeed = 0.05;
    
    // Auto-rotation active when user is not interacting
    this.autoRotate = true;
    this.autoRotateSpeed = 0.003;
    this.idleTimer = null;

    // Materials dictionary
    this.materials = {
      primary: null,
      secondary: null,
      accent: null
    };

    this.init();
  }

  initMock() {
    this.container.innerHTML = '';
    
    // Create 2D canvas
    this.canvas2d = document.createElement('canvas');
    this.canvas2d.width = this.container.clientWidth || 400;
    this.canvas2d.height = this.container.clientHeight || 380;
    this.canvas2d.style.width = '100%';
    this.canvas2d.style.height = '100%';
    this.container.appendChild(this.canvas2d);
    
    this.ctx = this.canvas2d.getContext('2d');
    this.activeModelName = "COMMUNICATION ROBOT";
    this.angle = 0;
    
    // Bind resize
    window.addEventListener('resize', () => {
      if (this.canvas2d && this.container) {
        this.canvas2d.width = this.container.clientWidth;
        this.canvas2d.height = this.container.clientHeight;
        this.renderMock();
      }
    });

    // Start mock animation loop
    this.animateMock();
    
    // Bind reset view button mock
    const resetBtn = document.getElementById('btn-reset-view');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.angle = 0;
        this.renderMock();
      });
    }
  }

  renderMock() {
    if (!this.canvas2d || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas2d.width;
    const h = this.canvas2d.height;
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    // Background
    ctx.fillStyle = theme === 'dark' ? '#030303' : '#fcfcfc';
    ctx.fillRect(0, 0, w, h);
    
    // Grid Lines
    ctx.strokeStyle = theme === 'dark' ? '#111111' : '#eeeeee';
    ctx.lineWidth = 1;
    const gridSpacing = 20;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    
    // Draw wireframe depending on project
    const strokeColor = theme === 'dark' ? '#ffffff' : '#000000';
    const accentStroke = theme === 'dark' ? '#666666' : '#999999';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(this.angle);
    
    if (this.activeModelName.includes("COMMUNICATION") || this.activeModelName.includes("ASK")) {
      // Draw circular drone shape
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();

      // Propeller axes
      ctx.strokeStyle = accentStroke;
      ctx.beginPath();
      ctx.moveTo(-65, -65); ctx.lineTo(65, 65);
      ctx.moveTo(-65, 65); ctx.lineTo(65, -65);
      ctx.stroke();

      // Rotor circles
      ctx.strokeStyle = strokeColor;
      const rotors = [[-65,-65], [65,-65], [-65,65], [65,65]];
      rotors.forEach(([rx, ry]) => {
        ctx.beginPath(); ctx.arc(rx, ry, 12, 0, Math.PI*2); ctx.stroke();
      });
    } else if (this.activeModelName.includes("ARM")) {
      // Draw a simple 2D multi-joint arm
      ctx.beginPath();
      ctx.moveTo(-30, 80);
      ctx.lineTo(30, 80);
      ctx.moveTo(0, 80);
      ctx.lineTo(0, 20);
      ctx.lineTo(50, -20);
      ctx.lineTo(30, -70);
      ctx.stroke();
      
      // Gripper claws
      ctx.beginPath();
      ctx.moveTo(30, -70); ctx.lineTo(15, -80);
      ctx.moveTo(30, -70); ctx.lineTo(45, -80);
      ctx.stroke();
      
      // Draw joints
      ctx.fillStyle = strokeColor;
      ctx.beginPath(); ctx.arc(0, 20, 6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(50, -20, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(30, -70, 4, 0, Math.PI*2); ctx.fill();
    } else {
      // Plastic remover tank box
      ctx.beginPath();
      ctx.rect(-60, -35, 120, 70);
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(20, -20, 40, 40);
      ctx.stroke();

      // Wheels
      ctx.strokeStyle = accentStroke;
      ctx.beginPath();
      ctx.arc(-40, 48, 14, 0, Math.PI*2);
      ctx.arc(40, 48, 14, 0, Math.PI*2);
      ctx.stroke();

      // Sweep drum
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(75, 10, 16, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();
    
    // Info text overlay
    ctx.fillStyle = theme === 'dark' ? '#8c8c8c' : '#666666';
    ctx.font = '10px monospace';
    ctx.fillText(`MOCK 2D WIREFRAME ACTIVE // CDN OFFLINE`, 15, h - 15);
    
    if (this.coordsDisplay) {
      this.coordsDisplay.innerText = `ROT: X:0.00 Y:${this.angle.toFixed(2)} | MOCK ACTIVE`;
    }
  }

  animateMock() {
    if (!this.isMock) return;
    this.angle += 0.008;
    this.renderMock();
    requestAnimationFrame(() => this.animateMock());
  }

  loadModelMock(projectType) {
    this.activeModelName = projectType.toUpperCase();
    this.angle = 0;
    this.renderMock();
  }

  updateMaterialsMock(theme) {
    this.renderMock();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    
    // Set background color based on theme
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    this.scene.background = new THREE.Color(theme === 'dark' ? 0x030303 : 0xfcfcfc);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Model group container
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    // Setup materials based on active theme
    this.updateMaterials(theme);

    // Grid Helper
    this.gridHelper = new THREE.GridHelper(20, 20, 
      theme === 'dark' ? 0x333333 : 0xcccccc, 
      theme === 'dark' ? 0x111111 : 0xeeeeee
    );
    this.gridHelper.position.y = -2;
    this.scene.add(this.gridHelper);

    // Register event listeners
    this.setupEvents();

    // Start animation loop
    this.animate();
  }

  updateMaterials(theme) {
    if (this.isMock) {
      this.updateMaterialsMock(theme);
      return;
    }
    const isDark = theme === 'dark';
    const primaryColor = isDark ? 0xffffff : 0x000000;
    const secondaryColor = isDark ? 0x888888 : 0x666666;
    const accentColor = isDark ? 0x555555 : 0xaaaaaa;

    // Line/Wireframe Materials
    if (!this.materials.primary) {
      this.materials.primary = new THREE.MeshBasicMaterial({ 
        color: primaryColor, 
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      this.materials.secondary = new THREE.MeshBasicMaterial({ 
        color: secondaryColor, 
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      this.materials.accent = new THREE.MeshBasicMaterial({ 
        color: accentColor, 
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
    } else {
      this.materials.primary.color.setHex(primaryColor);
      this.materials.secondary.color.setHex(secondaryColor);
      this.materials.accent.color.setHex(accentColor);
    }

    if (this.scene) {
      this.scene.background = new THREE.Color(isDark ? 0x030303 : 0xfcfcfc);
      if (this.gridHelper) {
        this.scene.remove(this.gridHelper);
        this.gridHelper = new THREE.GridHelper(20, 20, 
          isDark ? 0x333333 : 0xcccccc, 
          isDark ? 0x1a1a1a : 0xeeeeee
        );
        this.gridHelper.position.y = -2;
        this.scene.add(this.gridHelper);
      }
    }
  }

  // Load a mesh group representing the active robotic project
  loadModel(projectType) {
    if (this.isMock) {
      this.loadModelMock(projectType);
      return;
    }
    // Clear existing model children
    while (this.modelGroup.children.length > 0) {
      this.modelGroup.remove(this.modelGroup.children[0]);
    }

    // Reset rotation of model group
    this.modelGroup.rotation.set(0.1, 0, 0);
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 0, 0);
    this.updateCoordsDisplay();

    switch (projectType) {
      case 'COMMUNICATION ROBOT':
      case 'communication-robot':
        this.buildCommunicationRobot();
        break;
      case 'ROBOTIC ARM':
      case 'robotic-arm':
        this.buildRoboticArm();
        break;
      case 'PLASTIC REMOVING MACHINE':
      case 'plastic-remover':
        this.buildPlasticRemover();
        break;
      default:
        this.buildDefaultWidget();
    }
  }

  // Model builder 1: Communication Robot (Ask Doubts Drone)
  buildCommunicationRobot() {
    const group = new THREE.Group();

    // Main spherical core
    const coreGeo = new THREE.SphereGeometry(1.4, 12, 12);
    const core = new THREE.Mesh(coreGeo, this.materials.primary);
    group.add(core);

    // Eye/camera lens
    const lensGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 12);
    const lens = new THREE.Mesh(lensGeo, this.materials.primary);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0.2, 1.2);
    group.add(lens);

    // Antenna on top
    const antennaStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
    const antennaStem = new THREE.Mesh(antennaStemGeo, this.materials.secondary);
    antennaStem.position.set(0, 1.8, 0);
    group.add(antennaStem);

    const antennaTipGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const antennaTip = new THREE.Mesh(antennaTipGeo, this.materials.primary);
    antennaTip.position.set(0, 2.4, 0);
    group.add(antennaTip);

    // 4 Quadcopter Arm extensions
    const armPositions = [
      { x: 1.5, z: 1.5 },
      { x: -1.5, z: 1.5 },
      { x: 1.5, z: -1.5 },
      { x: -1.5, z: -1.5 }
    ];

    armPositions.forEach((pos, idx) => {
      // Boom arm
      const armGeo = new THREE.BoxGeometry(0.15, 0.15, 1.8);
      const arm = new THREE.Mesh(armGeo, this.materials.accent);
      arm.position.set(pos.x / 2, -0.2, pos.z / 2);
      arm.lookAt(pos.x, -0.2, pos.z);
      group.add(arm);

      // Motor hub
      const motorGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 8);
      const motor = new THREE.Mesh(motorGeo, this.materials.secondary);
      motor.position.set(pos.x, 0, pos.z);
      group.add(motor);

      // Propeller blades (represented by lines / thin boxes)
      const propGroup = new THREE.Group();
      propGroup.position.set(pos.x, 0.25, pos.z);
      
      const bladeGeo = new THREE.BoxGeometry(1.2, 0.03, 0.1);
      const blade = new THREE.Mesh(bladeGeo, this.materials.primary);
      propGroup.add(blade);
      
      // Store reference to rotate propellers in animate loop
      propGroup.name = `prop_${idx}`;
      group.add(propGroup);
    });

    this.modelGroup.add(group);
  }

  // Model builder 2: Robotic Arm
  buildRoboticArm() {
    const group = new THREE.Group();

    // Base plate
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 12);
    const base = new THREE.Mesh(baseGeo, this.materials.primary);
    base.position.y = -1.6;
    group.add(base);

    // Shoulder swivel joint
    const shoulderJointGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.8, 8);
    const shoulderJoint = new THREE.Mesh(shoulderJointGeo, this.materials.secondary);
    shoulderJoint.position.y = -1.1;
    group.add(shoulderJoint);

    // Link 1 (Lower Arm)
    const arm1Group = new THREE.Group();
    arm1Group.position.set(0, -1.0, 0);
    
    const arm1Geo = new THREE.BoxGeometry(0.4, 2.0, 0.4);
    // Align origin to joint
    const arm1Mesh = new THREE.Mesh(arm1Geo, this.materials.primary);
    arm1Mesh.position.y = 1.0;
    arm1Group.add(arm1Mesh);
    
    // Elbow joint
    const elbowJointGeo = new THREE.SphereGeometry(0.45, 10, 10);
    const elbowJoint = new THREE.Mesh(elbowJointGeo, this.materials.secondary);
    elbowJoint.position.y = 2.0;
    arm1Group.add(elbowJoint);

    // Link 2 (Upper Arm)
    const arm2Group = new THREE.Group();
    arm2Group.position.set(0, 2.0, 0);
    
    const arm2Geo = new THREE.BoxGeometry(0.3, 1.6, 0.3);
    const arm2Mesh = new THREE.Mesh(arm2Geo, this.materials.primary);
    arm2Mesh.position.y = 0.8;
    arm2Group.add(arm2Mesh);

    // Wrist joint
    const wristGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const wrist = new THREE.Mesh(wristGeo, this.materials.accent);
    wrist.position.y = 1.6;
    arm2Group.add(wrist);

    // Gripper / Claw
    const gripperGroup = new THREE.Group();
    gripperGroup.position.y = 1.75;
    
    const gripperBaseGeo = new THREE.BoxGeometry(0.6, 0.2, 0.2);
    const gripperBase = new THREE.Mesh(gripperBaseGeo, this.materials.primary);
    gripperGroup.add(gripperBase);

    // Two fingers
    const finger1Geo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const finger1 = new THREE.Mesh(finger1Geo, this.materials.secondary);
    finger1.position.set(-0.25, 0.25, 0);
    
    const finger2 = finger1.clone();
    finger2.position.x = 0.25;

    gripperGroup.add(finger1);
    gripperGroup.add(finger2);
    arm2Group.add(gripperGroup);

    arm1Group.add(arm2Group);
    group.add(arm1Group);

    // Animate angles inside groups (semi-pose)
    arm1Group.rotation.z = 0.25;
    arm2Group.rotation.z = -0.55;
    gripperGroup.rotation.y = 0.5;

    // Keep references for dynamic joint bending animation
    group.name = "arm_root";
    this.modelGroup.add(group);
  }

  // Model builder 3: Plastic Removing Machine
  buildPlasticRemover() {
    const group = new THREE.Group();

    // Chassis Box
    const chassisGeo = new THREE.BoxGeometry(3.2, 0.8, 2.0);
    const chassis = new THREE.Mesh(chassisGeo, this.materials.primary);
    chassis.position.y = -0.4;
    group.add(chassis);

    // Collection Bin (Container behind)
    const binGeo = new THREE.BoxGeometry(2.0, 1.0, 1.8);
    const bin = new THREE.Mesh(binGeo, this.materials.secondary);
    bin.position.set(-0.5, 0.5, 0);
    group.add(bin);

    // 4 Wheels
    const wheelPositions = [
      { x: 1.1, y: -0.8, z: 1.1 },
      { x: -1.1, y: -0.8, z: 1.1 },
      { x: 1.1, y: -0.8, z: -1.1 },
      { x: -1.1, y: -0.8, z: -1.1 }
    ];

    wheelPositions.forEach((pos, idx) => {
      const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 10);
      const wheel = new THREE.Mesh(wheelGeo, this.materials.primary);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.name = `wheel_${idx}`;
      group.add(wheel);
    });

    // Sweeper / Conveyor scoop at the front
    const scoopGroup = new THREE.Group();
    scoopGroup.position.set(1.6, -0.6, 0);
    
    // Slanted collection ramp
    const rampGeo = new THREE.BoxGeometry(0.8, 0.1, 1.8);
    const ramp = new THREE.Mesh(rampGeo, this.materials.primary);
    ramp.rotation.z = -Math.PI / 6;
    ramp.position.set(0.2, 0.1, 0);
    scoopGroup.add(ramp);

    // Sweeper Drum (cylinder with ridges)
    const drumGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.6, 8);
    const drum = new THREE.Mesh(drumGeo, this.materials.secondary);
    drum.rotation.x = Math.PI / 2;
    drum.position.set(0.5, 0.35, 0);
    drum.name = "sweeper_drum";
    scoopGroup.add(drum);

    group.add(scoopGroup);

    // Sensor / Antenna on top of the bin
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4);
    const pole = new THREE.Mesh(poleGeo, this.materials.accent);
    pole.position.set(-1.2, 1.4, 0.6);
    group.add(pole);

    const domeGeo = new THREE.SphereGeometry(0.15, 6, 6);
    const dome = new THREE.Mesh(domeGeo, this.materials.primary);
    dome.position.set(-1.2, 1.8, 0.6);
    group.add(dome);

    this.modelGroup.add(group);
  }

  // Fallback default wireframe cube
  buildDefaultWidget() {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(geo, this.materials.primary);
    this.modelGroup.add(cube);
  }

  // Custom Mouse Drag Controls
  setupEvents() {
    const dom = this.renderer.domElement;

    // Prevent default right-click menu on canvas
    dom.addEventListener('contextmenu', e => e.preventDefault());

    // Mouse Down
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      clearTimeout(this.idleTimer);

      if (e.button === 0) {
        this.dragMode = 'rotate';
      } else if (e.button === 2) {
        this.dragMode = 'pan';
      }

      this.previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    });

    // Mouse Move
    dom.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      if (this.dragMode === 'rotate') {
        // Rotate model group
        this.modelGroup.rotation.y += deltaX * this.rotationSpeed;
        this.modelGroup.rotation.x += deltaY * this.rotationSpeed;
      } else if (this.dragMode === 'pan') {
        // Pan camera
        this.camera.position.x -= deltaX * this.panSpeed;
        this.camera.position.y += deltaY * this.panSpeed;
      }

      this.previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };

      this.updateCoordsDisplay();
    });

    // Mouse Up
    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        // Resume auto-rotation after 6 seconds of inactivity
        this.idleTimer = setTimeout(() => {
          this.autoRotate = true;
        }, 6000);
      }
    });

    // Scroll Zoom
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.autoRotate = false;
      clearTimeout(this.idleTimer);
      
      const zoomVal = e.deltaY * this.zoomSpeed * 0.1;
      this.camera.position.z = Math.max(3, Math.min(20, this.camera.position.z + zoomVal));
      
      this.idleTimer = setTimeout(() => {
        this.autoRotate = true;
      }, 6000);
    });

    // Handle Resize
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    // Reset View Button
    const resetBtn = document.getElementById('btn-reset-view');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.modelGroup.rotation.set(0.1, 0, 0);
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 0, 0);
        this.updateCoordsDisplay();
        this.autoRotate = true;
      });
    }
  }

  updateCoordsDisplay() {
    if (this.coordsDisplay) {
      const rx = this.modelGroup.rotation.x.toFixed(2);
      const ry = this.modelGroup.rotation.y.toFixed(2);
      const z = this.camera.position.z.toFixed(1);
      this.coordsDisplay.innerText = `ROT: X:${rx} Y:${ry} | ZOOM: ${z}`;
    }
  }

  // Main render animation loop
  animate() {
    requestAnimationFrame(() => this.animate());

    // Idle Auto-rotation
    if (this.autoRotate) {
      this.modelGroup.rotation.y += this.autoRotateSpeed;
      this.updateCoordsDisplay();
    }

    // Dynamic model sub-parts animation (like propellers, joints, sweepers)
    this.animateModelParts();

    this.renderer.render(this.scene, this.camera);
  }

  animateModelParts() {
    // Propeller spinning for communication drone
    for (let i = 0; i < 4; i++) {
      const prop = this.modelGroup.getObjectByName(`prop_${i}`);
      if (prop) {
        prop.rotation.y += 0.2; // spin fast
      }
    }

    // Robotic arm joints breathing movement
    const armRoot = this.modelGroup.getObjectByName("arm_root");
    if (armRoot && this.autoRotate) {
      const time = Date.now() * 0.001;
      const arm1 = armRoot.children[2]; // Index depends on group construction
      if (arm1) {
        arm1.rotation.z = 0.2 + Math.sin(time) * 0.1;
        const arm2 = arm1.children[2]; // arm2 group
        if (arm2) {
          arm2.rotation.z = -0.55 + Math.cos(time * 1.2) * 0.15;
          const gripper = arm2.children[2];
          if (gripper) {
            gripper.rotation.y = 0.5 + Math.sin(time * 2.0) * 0.2;
          }
        }
      }
    }

    // Plastic remover sweeper drum and wheel rotation
    const sweeperDrum = this.modelGroup.getObjectByName("sweeper_drum");
    if (sweeperDrum) {
      sweeperDrum.rotation.y += 0.08;
    }
    for (let i = 0; i < 4; i++) {
      const wheel = this.modelGroup.getObjectByName(`wheel_${i}`);
      if (wheel && this.autoRotate) {
        wheel.rotation.y += 0.02;
      }
    }
  }
}
