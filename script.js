(function() {
  window.addEventListener("load", () => {
    // ==================================================
    // PNG Sequence Preloading & Canvas Setup for Album Animation
    // ==================================================
    const totalFrames = 40; // Frames: 0001.png to 0040.png
    const frames = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNumber = String(i).padStart(4, '0');
      img.src = `assets/animation/${frameNumber}.png`;
      frames.push(img);
    }
    
    const albumCanvas = document.getElementById("album-canvas");
    if (!albumCanvas) {
      console.error("album-canvas element not found");
      return;
    }
    const ctx = albumCanvas.getContext("2d");
    
    function resizeCanvas() {
      if (window.innerWidth < 1025) {
        albumCanvas.width = window.innerHeight;
        albumCanvas.height = window.innerWidth;
      } else {
        albumCanvas.width = window.innerWidth;
        albumCanvas.height = window.innerHeight;
      }
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    function drawCoverImage(img, ctx, cw, ch) {
      const iw = img.width, ih = img.height;
      const imgAspect = iw / ih;
      const canvasAspect = cw / ch;
      let sx, sy, sw, sh;
      if (imgAspect > canvasAspect) {
        sh = ih;
        sw = ih * canvasAspect;
        sx = (iw - sw) / 2;
        sy = 0;
      } else {
        sw = iw;
        sh = iw / canvasAspect;
        sx = 0;
        sy = (ih - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    }
    
    function drawAlbumFrame(progress) {
      const frameIndex = Math.min(totalFrames - 1, Math.floor(progress * totalFrames));
      const img = frames[frameIndex];
      if (img && img.complete) {
        ctx.clearRect(0, 0, albumCanvas.width, albumCanvas.height);
        if (window.innerWidth < 1025) {
          drawCoverImage(img, ctx, albumCanvas.width, albumCanvas.height);
        } else {
          ctx.drawImage(img, 0, 0, albumCanvas.width, albumCanvas.height);
        }
      }
    }
    
    // ==================================================
    // Smooth Scrubbing & Delayed Opacity Mapping for PNG Sequence
    // ==================================================
    let albumProgress = 0;
    let targetAlbumProgress = 0;
    const SMOOTHING_FACTOR = 0.4;
    
    function mapProgress(p) {
      const startDelay = 6 / totalFrames; // ~0.15
      const endDelay = (totalFrames - 6) / totalFrames; // ~0.85
      if (p < startDelay) return 0;
      if (p > endDelay) return 1;
      return (p - startDelay) / (endDelay - startDelay);
    }
    
    function updateAlbumCanvas() {
      albumProgress += (targetAlbumProgress - albumProgress) * SMOOTHING_FACTOR;
      drawAlbumFrame(albumProgress);
      if (currentSection === "album") {
        const mapped = mapProgress(albumProgress);
        document.querySelectorAll('.album-header, .album-outnow, .album-by, .album-icons')
          .forEach(el => { el.style.opacity = 1 - mapped; });
        document.querySelectorAll('.pop-image, .pop-button')
          .forEach(el => { el.style.opacity = mapped; });
      }
      requestAnimationFrame(updateAlbumCanvas);
    }
    
    Promise.all(frames.map(img => new Promise(resolve => {
      if (img.complete) resolve();
      else { img.onload = resolve; img.onerror = resolve; }
    }))).then(() => {
      updateAlbumCanvas();
    });
    
    // ==================================================
    // JS-Driven Videos Ticker Animation Using setInterval
    // ==================================================
    let tickerLoopDistance = 0;
    let tickerSpeed = 30; // pixels per second
    const tickerContent = document.querySelector('.videos-ticker-content');
    let currentTickerOffset = 0;
    let tickerInterval = null;
    
    function initVideosTicker() {
      if (!tickerContent) return;
      tickerContent.style.animation = 'none';
      // Assume the ticker content is duplicated once; measure loop distance.
      tickerLoopDistance = tickerContent.scrollWidth / 2;
      currentTickerOffset = 0;
      if (tickerInterval) clearInterval(tickerInterval);
      tickerInterval = setInterval(() => {
        currentTickerOffset += tickerSpeed * 0.016; // update every 16ms (~60fps)
        currentTickerOffset %= tickerLoopDistance;
        tickerContent.style.transform = `translate3d(-${currentTickerOffset}px, 0, 0)`;
      }, 16);
    }
    
    initVideosTicker();
    window.addEventListener('resize', initVideosTicker);
    
    // ==================================================
    // Ticker Cloning Functions (For non-listen tickers)
    // ==================================================
    function cloneTickerContent(containerSelector, contentSelector, multiplier) {
      // Skip cloning for the Listen ticker – it will be handled separately
      if (containerSelector.indexOf('listen') !== -1) return;
      const container = document.querySelector(containerSelector);
      const content = document.querySelector(contentSelector);
      if (!container || !content) return;
      const containerHeight = container.getBoundingClientRect().height || window.innerHeight;
      const firstLine = content.firstElementChild;
      if (!firstLine) return;
      const template = firstLine.cloneNode(true);
      content.innerHTML = "";
      content.appendChild(template);
      const lineHeight = template.getBoundingClientRect().height;
      if (lineHeight === 0) return;
      const copiesNeeded = Math.ceil((containerHeight * multiplier) / lineHeight);
      for (let i = 1; i < copiesNeeded; i++) {
        content.appendChild(template.cloneNode(true));
      }
    }
    
    function cloneHorizontalTickerContent(containerSelector, contentSelector, multiplier) {
      const container = document.querySelector(containerSelector);
      const content = document.querySelector(contentSelector);
      if (!container || !content) return;
      const containerWidth = container.getBoundingClientRect().width || window.innerWidth;
      const firstChild = content.firstElementChild;
      if (!firstChild) return;
      const template = firstChild.cloneNode(true);
      content.innerHTML = "";
      content.appendChild(template);
      const childWidth = template.getBoundingClientRect().width;
      if (childWidth === 0) return;
      const copiesNeeded = Math.ceil((containerWidth * multiplier) / childWidth);
      for (let i = 1; i < copiesNeeded; i++) {
        content.appendChild(template.cloneNode(true));
      }
    }
    
    function forceReflow(element) {
      if (!element) return;
      void element.offsetHeight;
    }
    
    function initTickers() {
      setTimeout(() => {
        // Only clone non-listen tickers (fumbled, honey, recognize)
        cloneTickerContent('.vertical-ticker.fumbled', '.vertical-ticker-content.fumbled', 2);
        cloneTickerContent('.vertical-ticker.honey', '.vertical-ticker-content.honey', 2);
        cloneTickerContent('.vertical-ticker.recognize', '.vertical-ticker-content.recognize', 2);
        // Horizontal ticker cloning remains as before.
        cloneHorizontalTickerContent('.videos-ticker-wrapper', '.videos-ticker-content', 15);
        setTimeout(() => {
          const singles = document.querySelector('.singles-section');
          forceReflow(singles);
        }, 500);
      }, 600);
    }
    initTickers();
    window.addEventListener("resize", initTickers);
    
    // ==================================================
    // Listen Ticker Initialization
    // ==================================================
    function initListenTicker() {
      const container = document.querySelector('.vertical-ticker.listen');
      const content = container.querySelector('.vertical-ticker-content.listen');
      // Use the initial markup (a single copy) as template.
      const templateHTML = `<p class="ticker-text">
          <a href="https://www.google.com" target="_blank" class="ticker-link">Listen</a>
        </p>`;
      content.innerHTML = templateHTML;
      // Clone until content height is at least twice the container's height.
      while(content.offsetHeight < container.offsetHeight * 2) {
        content.innerHTML += templateHTML;
      }
      // Calculate the scroll distance (we use half the total content height for a seamless loop)
      const scrollDistance = content.offsetHeight / 2;
      const speed = 30; // pixels per second (adjust as needed)
      const duration = scrollDistance / speed;
      // Set the CSS variable --ticker-duration on the content element.
      content.style.setProperty('--ticker-duration', duration + 's');
    }
    
    initListenTicker();
    window.addEventListener('resize', initListenTicker);
    
    // ==================================================
    // Intro Section Effects (Leave unchanged)
    // ==================================================
    function initIntroSection() {
      const codingContainer = document.querySelector('.coding-text');
      if (!codingContainer) {
        console.error("No .coding-text element found.");
        return;
      }
      const codingParagraph = document.createElement('p');
      codingContainer.appendChild(codingParagraph);
      const codingText = `INIT_SEQUENCE_START; PROTOCOL_OVERRIDE_ACTIVE; QUERY_ADDRESS: NODE_ALPHA_7;
SYSTEM_DIAGNOSTIC_RUN; CORE_TEMP: 47.3C; VENTILATION_STATUS: OPTIMAL;
ATMOSPHERIC_PRESSURE: 1013.25hPa; OXYGEN_LEVEL: 20.9%; VISUAL_FEED: ENGAGED;
AUDIO_FEED: MUTED; TACTILE_FEED: OFFLINE; NETWORK_CONNECTIVITY: ESTABLISHED;
DATA_STREAM_INTEGRITY: VALIDATED; SECURITY_PROTOCOL: LEVEL_7; FIREWALL_STATUS: ACTIVE;
INTRUSION_DETECTION: MONITORING; MALWARE_SCAN: COMPLETE; SYSTEM_CLOCK: SYNC_2077.10.27.14.32.57;
GEO_LOCATION: LAT: 34.0522; LONG: -118.2437; POWER_LEVEL: 98%; BACKUP_SYSTEM: ONLINE;
EMERGENCY_PROTOCOL: STANDBY; OVERRIDE_CODE: ALPHA_DELTA_CHARLIE_9; TARGET_ACQUISITION: LOCKED;
WEAPON_STATUS: ARMED; SHIELD_STATUS: ONLINE; PROPULSION_SYSTEM: ENGAGED;
NAVIGATION_COORDINATES: X: 42.7; Y: 19.3; Z: 88.1; COMM_CHANNEL: SECURE_1;
MESSAGE_ID: 74B39A; RECIPIENT: COMMAND_CENTER_EAST; PRIORITY: HIGH;
SUBJECT: OPERATIONAL_UPDATE; CONTENT: MISSION_OBJECTIVE_COMPLETE;
CASUALTIES: ZERO; DAMAGE_ASSESSMENT: MINIMAL; RETURN_ETA: 17:00 HOURS;
END_TRANSMISSION; REBOOT_SEQUENCE_INITIATED; SYSTEM_RESTORATION_COMPLETE;
ALL_SYSTEMS_NOMINAL; STATUS_REPORT: GREEN; AWAITING_FURTHER_INSTRUCTIONS; INIT_SEQUENCE_START; PROTOCOL_OVERRIDE_ACTIVE; QUERY_ADDRESS: NODE_ALPHA_7;
SYSTEM_DIAGNOSTIC_RUN; CORE_TEMP: 47.3C; VENTILATION_STATUS: OPTIMAL;
ATMOSPHERIC_PRESSURE: 1013.25hPa; OXYGEN_LEVEL: 20.9%; VISUAL_FEED: ENGAGED;
AUDIO_FEED: MUTED; TACTILE_FEED: OFFLINE; NETWORK_CONNECTIVITY: ESTABLISHED;
DATA_STREAM_INTEGRITY: VALIDATED; SECURITY_PROTOCOL: LEVEL_7; FIREWALL_STATUS: ACTIVE;
INTRUSION_DETECTION: MONITORING; MALWARE_SCAN: COMPLETE; SYSTEM_CLOCK: SYNC_2077.10.27.14.32.57;
GEO_LOCATION: LAT: 34.0522; LONG: -118.2437; POWER_LEVEL: 98%; BACKUP_SYSTEM: ONLINE;
EMERGENCY_PROTOCOL: STANDBY; OVERRIDE_CODE: ALPHA_DELTA_CHARLIE_9; TARGET_ACQUISITION: LOCKED;
WEAPON_STATUS: ARMED; SHIELD_STATUS: ONLINE; PROPULSION_SYSTEM: ENGAGED;
NAVIGATION_COORDINATES: X: 42.7; Y: 19.3; Z: 88.1; COMM_CHANNEL: SECURE_1;
MESSAGE_ID: 74B39A; RECIPIENT: COMMAND_CENTER_EAST; PRIORITY: HIGH;
SUBJECT: OPERATIONAL_UPDATE; CONTENT: MISSION_OBJECTIVE_COMPLETE;
CASUALTIES: ZERO; DAMAGE_ASSESSMENT: MINIMAL; RETURN_ETA: 17:00 HOURS;
END_TRANSMISSION; REBOOT_SEQUENCE_INITIATED; SYSTEM_RESTORATION_COMPLETE;
ALL_SYSTEMS_NOMINAL; STATUS_REPORT: GREEN; AWAITING_FURTHER_INSTRUCTIONS;`;
      const prefillCount = 2000;
      let visibleText = codingText.slice(-prefillCount);
      codingParagraph.textContent = visibleText;
      let index = 0;
      function typeLetter() {
        visibleText += codingText[index];
        codingParagraph.textContent = visibleText;
        index = (index + 1) % codingText.length;
        codingContainer.scrollTop = codingContainer.scrollHeight - codingContainer.clientHeight;
        setTimeout(typeLetter, 30);
      }
      typeLetter();
    
      const scrollContainer = document.querySelector('.scroll-text');
      if (scrollContainer) {
        const scrollParagraph = document.createElement('p');
        scrollContainer.appendChild(scrollParagraph);
        const scrollText = "SCROLL TO ENTER";
        let scrollIndex = 0;
        let scrollVisibleText = "";
        function typeScrollLetter() {
          scrollVisibleText += scrollText[scrollIndex];
          scrollParagraph.innerHTML = scrollVisibleText + '<span class="cursor typing">|</span>';
          scrollIndex++;
          if (scrollIndex < scrollText.length) {
            const delay = Math.floor(Math.random() * 200) + 150;
            setTimeout(typeScrollLetter, delay);
          } else {
            const cursorElem = scrollParagraph.querySelector('.cursor');
            if (cursorElem) cursorElem.classList.remove("typing");
          }
        }
        typeScrollLetter();
      }
    }
    initIntroSection();
    
    // ==================================================
    // Section Transition & Album Canvas Scrubbing
    // ==================================================
    let currentSection = "intro";  // "intro", "singles", "videos", "album"
    let accumulatedDelta = 0;
    const threshold = 300;
    const finalRadiusPercent = 150;
    let isTransitioning = false;
    let lockAlbumTransition = true;
    
    const introSection = document.querySelector('.intro-section');
    const singlesSection = document.querySelector('.singles-section');
    const videosSection = document.querySelector('.videos-section');
    const albumSection = document.querySelector('.album-section');
    
    // ==================================================
    // Unified Wheel & Touch Event Handling
    // ==================================================
    let pendingDelta = 0;
    let scrollScheduled = false;
    let touchStartY = null;
    const deltaMultiplier = 1;
    
    function onTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e) {
      if (touchStartY === null) return;
      const deltaY = (touchStartY - e.touches[0].clientY) * deltaMultiplier;
      pendingDelta += deltaY;
      touchStartY = e.touches[0].clientY;
      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(processWheel);
      }
      e.preventDefault();
    }
    function onTouchEnd() {
      touchStartY = null;
    }
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    
    function onWheel(e) {
      if (isTransitioning) return;
      e.preventDefault();
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 33;
      else if (e.deltaMode === 2) delta *= window.innerHeight;
      pendingDelta += delta * deltaMultiplier;
      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(processWheel);
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    
    function processWheel() {
      scrollScheduled = false;
      if (isTransitioning) { pendingDelta = 0; return; }
      accumulatedDelta += pendingDelta;
      pendingDelta = 0;
      
      console.log("Section:", currentSection, "Accumulated Delta:", accumulatedDelta);
      
      // ----- Transition: Intro <-> Singles -----
      if (currentSection === "intro") {
        let progress = accumulatedDelta / threshold;
        if (progress > 1) progress = 1;
        singlesSection.style.clipPath = `circle(${progress * finalRadiusPercent}% at center)`;
        if (accumulatedDelta >= threshold) {
          isTransitioning = true;
          singlesSection.style.clipPath = `circle(${finalRadiusPercent}% at center)`;
          introSection.classList.add("dismiss");
          currentSection = "singles";
          accumulatedDelta = 0;
          console.log("Transitioned to singles");
          setTimeout(() => { isTransitioning = false; }, 600);
        }
      } else if (currentSection === "singles") {
        if (accumulatedDelta >= threshold) {
          isTransitioning = true;
          // Transition from Singles -> Videos using fade (via active class)
          videosSection.classList.add("active");
          currentSection = "videos";
          accumulatedDelta = 0;
          lockAlbumTransition = true;
          console.log("Transitioned to videos");
          setTimeout(() => { 
            isTransitioning = false; 
            lockAlbumTransition = false; 
          }, 600);
        } else if (accumulatedDelta <= -threshold) {
          isTransitioning = true;
          // Reverse from Singles -> Intro
          singlesSection.style.clipPath = `circle(0% at center)`;
          introSection.classList.remove("dismiss");
          currentSection = "intro";
          accumulatedDelta = 0;
          console.log("Returned to intro");
          setTimeout(() => { isTransitioning = false; }, 600);
        }
      } else if (currentSection === "videos") {
        // ----- Transition: Videos -> Album (Forward) -----
        if (accumulatedDelta >= threshold && !lockAlbumTransition) {
          isTransitioning = true;
          videosSection.style.transition = "transform 0.5s ease-out";
          albumSection.style.transition = "transform 0.5s ease-out";
          videosSection.style.transform = "translateY(-100%)";
          albumSection.style.transform = "translateY(0%)";
          currentSection = "album";
          accumulatedDelta = 0;
          targetAlbumProgress = 0;
          console.log("Transitioned to album (snap)");
          setTimeout(() => {
            isTransitioning = false;
            videosSection.style.transition = "";
            albumSection.style.transition = "";
          }, 600);
        } else if (accumulatedDelta <= -threshold) {
          // ----- Reverse Transition: Videos -> Singles using fade -----
          isTransitioning = true;
          videosSection.classList.remove("active");
          // Ensure album section is off-screen
          albumSection.style.transform = "translateY(100%)";
          currentSection = "singles";
          accumulatedDelta = 0;
          console.log("Returned to singles from videos");
          setTimeout(() => {
            isTransitioning = false;
          }, 600);
        }
      }
      
      // ----- Album Section: Scroll-triggered Scrubbing of PNG Sequence & Reverse Transition -----
      if (currentSection === "album") {
        const albumScrubMultiplier = 0.6; // for smoother scrubbing
        if (accumulatedDelta !== 0) {
          targetAlbumProgress += (accumulatedDelta / threshold) * albumScrubMultiplier;
          targetAlbumProgress = Math.max(0, Math.min(1, targetAlbumProgress));
          console.log("Album target progress:", targetAlbumProgress.toFixed(2));
        }
        // Reverse trigger: if minimal progress and a slight upward scroll
        if (targetAlbumProgress <= 0.01 && accumulatedDelta <= -threshold * 0.1) {
          isTransitioning = true;
          currentSection = "videos";
          accumulatedDelta = 0;
          albumSection.style.transition = "transform 0.5s ease-out";
          videosSection.style.transition = "transform 0.5s ease-out";
          albumSection.style.transform = "translateY(100%)";
          videosSection.style.transform = "translateY(0%)";
          console.log("Exiting album to videos");
          document.querySelectorAll('.pop-image, .pop-button').forEach(el => el.style.opacity = 0);
          document.querySelectorAll('.album-header, .album-outnow, .album-by, .album-icons').forEach(el => el.style.opacity = 1);
          setTimeout(() => { 
            isTransitioning = false; 
            albumSection.style.transition = "";
            videosSection.style.transition = "";
          }, 600);
          targetAlbumProgress = 0;
        }
        accumulatedDelta = 0;
      }
    }
    
    // ==================================================
    // Vertical Ticker Click for Mobile/Tablet (Listen Ticker)
    // ==================================================
    if (window.innerWidth < 1025) {
      const listenLink = document.querySelector('.vertical-ticker.listen .ticker-link');
      if (listenLink) {
        listenLink.addEventListener('click', (e) => {
          e.preventDefault();
          listenLink.classList.toggle('active');
        });
      }
    }
  });
})();
