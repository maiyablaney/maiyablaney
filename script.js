window.addEventListener("load", () => {
  // ----------------------------------------------------------
  // Ticker Cloning Functions
  // ----------------------------------------------------------
  function cloneTickerContent(containerSelector, contentSelector, multiplier) {
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

  // ----------------------------------------------------------
  // Force Reflow Utility Function
  // ----------------------------------------------------------
  function forceReflow(element) {
    if (!element) return;
    void element.offsetHeight;
  }

  // ----------------------------------------------------------
  // Initialize Tickers with a Delayed Start
  // ----------------------------------------------------------
  function initTickers() {
    setTimeout(() => {
      cloneTickerContent('.vertical-ticker.listen', '.vertical-ticker-content.listen', 2);
      cloneTickerContent('.vertical-ticker.fumbled', '.vertical-ticker-content.fumbled', 2);
      cloneTickerContent('.vertical-ticker.honey', '.vertical-ticker-content.honey', 2);
      cloneTickerContent('.vertical-ticker.recognize', '.vertical-ticker-content.recognize', 2);
      cloneHorizontalTickerContent('.videos-ticker-wrapper', '.videos-ticker-content', 10);
      setTimeout(() => {
        const singles = document.querySelector('.singles-section');
        forceReflow(singles);
      }, 500);
    }, 600);
  }
  initTickers();
  window.addEventListener("resize", initTickers);

  // ----------------------------------------------------------
  // Intro Section Effects & Transitions
  // ----------------------------------------------------------
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
ALL_SYSTEMS_NOMINAL; STATUS_REPORT: GREEN; AWAITING_FURTHER_INSTRUCTIONS;
...`.trim();
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

    // Scroll-to-enter prompt with blinking cursor
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

  // ----------------------------------------------------------
  // Section Transition & Album Video Scrubbing Setup
  // ----------------------------------------------------------
  let currentSection = "intro";
  let accumulatedDelta = 0;
  const threshold = window.innerWidth < 600 ? 100 : 300;
  const finalRadiusPercent = 150;
  let isTransitioning = false;
  let lockAlbumTransition = true;

  const introSection = document.querySelector('.intro-section');
  const singlesSection = document.querySelector('.singles-section');
  const videosSection = document.querySelector('.videos-section');
  const albumSection = document.querySelector('.album-section');

  // Album Video Scrubbing Setup
  const albumVideo = document.getElementById("album-video");
  let albumProgress = 0;
  let targetAlbumProgress = 0;
  const SCROLL_THRESHOLD = 300;
  const SMOOTHING_FACTOR = 0.3;
  if (albumVideo) {
    albumVideo.addEventListener("loadedmetadata", () => {
      // Unlock video for scrubbing on mobile by playing then pausing it
      albumVideo.play().then(() => {
        albumVideo.pause();
        albumVideo.currentTime = 0;
        console.log("Album video unlocked. Duration:", albumVideo.duration);
      }).catch(err => {
        console.error("Error unlocking video for scrubbing:", err);
      });
    });
  }
  function updateAlbumVideo() {
    albumProgress += (targetAlbumProgress - albumProgress) * SMOOTHING_FACTOR;
    if (albumVideo) {
      albumVideo.currentTime = albumProgress * albumVideo.duration;
    }
    requestAnimationFrame(updateAlbumVideo);
  }
  updateAlbumVideo();

  // Additional mobile unlock on touchend
  window.addEventListener('touchend', () => {
    if (albumVideo && albumVideo.paused) {
      albumVideo.play().then(() => albumVideo.pause())
        .catch(err => console.error("Touchend unlock error:", err));
    }
  });

  // ----------------------------------------------------------
  // Unified Wheel & Touch Event Handling
  // ----------------------------------------------------------
  let pendingDelta = 0;
  let scrollScheduled = false;
  let touchStartY = null;
  function onTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (touchStartY === null) return;
    const deltaY = touchStartY - e.touches[0].clientY;
    pendingDelta += deltaY;
    touchStartY = e.touches[0].clientY;
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(processWheel);
    }
    e.preventDefault();
  }
  function onTouchEnd(e) {
    touchStartY = null;
  }
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: false });

  function onWheel(e) {
    if (isTransitioning) return;
    e.preventDefault();
    pendingDelta += e.deltaY;
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(processWheel);
    }
  }
  window.addEventListener('wheel', onWheel, { passive: false });

  function processWheel() {
    scrollScheduled = false;
    if (isTransitioning) {
      pendingDelta = 0;
      return;
    }
    const delta = Math.sign(pendingDelta) * Math.min(Math.abs(pendingDelta), threshold);
    accumulatedDelta += delta;
    pendingDelta = 0;

    // Transition: Intro <-> Singles
    if (currentSection === "intro") {
      const progress = Math.min(accumulatedDelta, threshold) / threshold;
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
    }
    // Transition: Singles <-> Videos
    else if (currentSection === "singles") {
      if (accumulatedDelta >= threshold) {
        isTransitioning = true;
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
        singlesSection.style.clipPath = `circle(0% at center)`;
        introSection.classList.remove("dismiss");
        currentSection = "intro";
        accumulatedDelta = 0;
        console.log("Returned to intro");
        setTimeout(() => { isTransitioning = false; }, 600);
      }
    }
    // Transition: Videos <-> Album
    else if (currentSection === "videos") {
      if (accumulatedDelta > 0 && !lockAlbumTransition) {
        const progress = Math.min(accumulatedDelta, threshold) / threshold;
        albumSection.style.transform = `translateY(${(1 - progress) * 100}%)`;
        videosSection.style.transform = `translateY(${-progress * 100}%)`;
        if (accumulatedDelta >= threshold) {
          isTransitioning = true;
          currentSection = "album";
          accumulatedDelta = 0;
          albumSection.style.transform = `translateY(0%)`;
          videosSection.style.transform = `translateY(-100%)`;
          console.log("Transitioned to album");
          targetAlbumProgress = 0;
          setTimeout(() => { isTransitioning = false; }, 600);
        }
      } else if (accumulatedDelta <= -threshold) {
        isTransitioning = true;
        videosSection.classList.remove("active");
        currentSection = "singles";
        accumulatedDelta = 0;
        videosSection.style.transform = `translateY(0%)`;
        albumSection.style.transform = `translateY(100%)`;
        console.log("Returned to singles from videos");
        setTimeout(() => { isTransitioning = false; }, 600);
      }
    }
    // Album Section: Video Scrubbing & Fade Transitions
    else if (currentSection === "album") {
      if (delta > 0) {
        targetAlbumProgress = Math.min(1, targetAlbumProgress + delta / SCROLL_THRESHOLD);
      } else if (delta < 0) {
        targetAlbumProgress = Math.max(0, targetAlbumProgress + delta / SCROLL_THRESHOLD);
      }
      if (albumProgress <= 0.01 && delta < 0 && accumulatedDelta <= -threshold * 2.0) {
        isTransitioning = true;
        currentSection = "videos";
        accumulatedDelta = 0;
        albumSection.style.transition = "transform 0.5s ease-out";
        videosSection.style.transition = "transform 0.5s ease-out";
        albumSection.style.transform = "translateY(100%)";
        videosSection.style.transform = "translateY(0%)";
        console.log("Returned to videos from album (reverse intensified)");
        setTimeout(() => {
          isTransitioning = false;
          albumSection.style.transition = "";
          videosSection.style.transition = "";
        }, 600);
        targetAlbumProgress = 0;
      }
      const progress = albumProgress;
      document.querySelectorAll('.album-header, .album-outnow, .album-by, .album-icons')
        .forEach(el => {
          el.style.opacity = 1 - progress;
        });
      document.querySelectorAll('.pop-image, .pop-button')
        .forEach(el => {
          el.style.opacity = progress;
        });
    }
  }
});
