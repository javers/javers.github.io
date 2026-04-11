---
layout: main
title: Join the JaVers Pro Early Access List
category: Contact
---

<link rel="stylesheet" href="/css/waiting-list.css">

<section class="wl-section">
    <div class="wl-inner">
        <div class="wl-header">
            <h1>The Future of JaVers is Pro</h1>
            <p>Join the waitlist for a <span class="bold">40% lifetime discount</span>. <span class="wl-countdown">Waitlist closes in <span id="cd-days" class="cd-green">--</span>d <span id="cd-hours" class="cd-green">--</span>h <span id="cd-mins">--</span>m <span id="cd-secs">--</span>s</span></p>
        </div>

        <div class="wl-grid">

            <div class="wl-card wl-card-oss">
                <h3>OSS Core</h3>
                <div class="price">$0</div>

                <div class="badge-spacer"></div>

                <div class="section-features mb-4">
                    <p class="row-label label-white">Features</p>
                    <ul class="feature-list text-sm text-white font-medium">
                        <li><span class="feature-icon">✓</span> Core Auditing Engine</li>
                    </ul>
                </div>

                <div class="section-support mb-4">
                    <p class="row-label label-white">Support</p>
                    <ul class="feature-list text-sm text-white font-medium">
                        <li><span class="feature-icon">✓</span> Community Support</li>
                    </ul>
                </div>
            </div>

            <div id="pro-card" onclick="selectTier('pro')" class="wl-card javers-card selected-tier">
                <h3 class="title-lg">Professional</h3>
                <p class="subtitle">Guaranteed compatibility. Priority support.</p>
                <div class="price-box">
                    <div class="price-row">
                        <span class="price-strike">~$99</span>
                        <span class="promo-price">~$59<span class="per-mo">/mo</span></span>
                    </div>
                    <span class="discount-badge">40% Waitlist Discount</span>
                </div>

                <div class="badge-spacer"></div>

                <div class="section-features mb-4">
                    <p class="row-label label-blue accent">Features</p>
                    <ul class="feature-list text-sm text-slate">
                        <li><span class="feature-icon icon-blue accent">✓</span> <strong>Audit Explorer UI</strong></li>
                        <li><span class="feature-icon icon-blue accent">✓</span> LTS Compatibility guarantees</li>
                    </ul>
                </div>

                <div class="section-support mb-4">
                    <p class="row-label label-blue accent">Support</p>
                    <ul class="feature-list text-sm text-slate">
                        <li><span class="feature-icon icon-blue accent">✓</span> <strong>Priority Bug Fixing</strong></li>
                        <li><span class="feature-icon icon-blue accent">✓</span> Private Slack</li>
                    </ul>
                </div>

                <div class="mt-auto">
                    <button onclick="revealForm('pro')" class="cta-button">Join Pro Waitlist</button>
                    <p class="no-cc">No credit card required</p>
                </div>
            </div>

            <div id="enterprise-card" onclick="selectTier('enterprise')" class="wl-card javers-card unselected-tier">
                <h3 class="title-md">Enterprise</h3>
                <p class="subtitle">Compliance-ready. SLA-backed.</p>
                <div class="price-box">
                    <div class="price-row">
                        <span class="price-strike">~$499</span>
                        <span class="promo-price">~$299<span class="per-mo">/mo</span></span>
                    </div>
                    <span class="discount-badge">40% Waitlist Discount</span>
                </div>

                <div id="tier-badge" class="tier-badge">
                    <p>
                        <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                        Includes All Pro Features
                    </p>
                </div>

                <div class="section-features mb-4">
                    <p class="row-label label-blue accent">Features</p>
                    <ul class="feature-list text-xs text-slate">
                        <li><span class="feature-icon icon-blue accent">✓</span> <strong>Javers Pro Repo (10x Faster)</strong></li>
                        <li><span class="feature-icon icon-blue accent">✓</span> Multi-tenancy &amp; Data Retention</li>
                        <li><span class="feature-icon icon-blue accent">✓</span> GDPR / SOX / HIPAA Compliance</li>
                    </ul>
                </div>

                <div class="section-support mb-4">
                    <p class="row-label label-blue accent">Support</p>
                    <ul class="feature-list text-xs text-slate">
                        <li><span class="feature-icon icon-blue accent">✓</span> <strong>Priority Bug Fixing + SLA</strong></li>
                    </ul>
                </div>

                <div class="mt-auto">
                    <button onclick="revealForm('enterprise')" class="cta-button">Join Enterprise Waitlist</button>
                    <p class="no-cc">No credit card required</p>
                </div>
            </div>
        </div>

        <div id="form-panel" class="form-panel-wrap">
            <div class="form-card">
                <h4 id="form-title">Join the Waitlist</h4>
                <p class="form-desc">Enter your work email to lock in your <span class="green">40% lifetime discount</span>.</p>
                <form id="waitlist-form">
                    <input type="hidden" id="tier-field" name="fields[tier]" value="">
                    <input type="hidden" name="anticsrf" value="true">
                    <input type="email" name="fields[email]" placeholder="work-email@company.com" required>
                    <textarea name="fields[pro_feedback]" placeholder="(Optional) What's your biggest Java auditing challenge?" rows="3"></textarea>

                    <div class="cf-turnstile" data-sitekey="0x4AAAAAACY-8HdUj3S60t53" data-callback="onTurnstileSuccess"></div>

                    <div class="row-error">
                        <strong>Something went wrong</strong>
                        <p id="error-message">Please try again later.</p>
                    </div>

                    <button type="submit" id="submit-btn" class="submit-btn">Join Pro Waitlist</button>
                </form>
                <p class="no-cc" style="margin-top:1rem;">No credit card required</p>
                <div class="privacy_policy_div">
                    <p>The information you provide on this form will only be used to provide you with
                    updates related to JaVers Pro Waiting List.
                    We will not share your information with any third parties.</p>
                    <p>You can unsubscribe anytime. For more details, review our <a href="/waiting-list-privacy-policy">Privacy Policy</a>.</p>
                </div>
            </div>
        </div>

        <div class="row-success">
            <div class="success-card">
                <div class="checkmark">&#10003;</div>
                <h4>Almost there! Check your inbox.</h4>
                <p>We sent a confirmation link to <strong id="submitted-email" class="email-addr"></strong>.</p>
                <p><strong style="color:#fff;">Click the link in that email</strong> to secure your spot.</p>
                <p>After confirming, you will receive your <strong class="green">40% lifetime discount code</strong>.</p>
            </div>
        </div>

    </div>
</section>

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<script>
    let turnstileVerified = false;

    function onTurnstileSuccess(token) {
      fetch("https://steep-voice-0584.bwalacik-098.workers.dev/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "cf-turnstile-response": token }),
      })
      .then(res => {
        if (!res.ok) throw new Error("Turnstile verification failed");
        return res.json();
      })
      .then(data => {
        turnstileVerified = true;
        console.log("turnstile verified");
      })
      .catch(err => {
        console.error(err);
        alert("Turnstile verification failed. Please try again.");
      });
    }

    function alignCardSections() {
      if (window.innerWidth < 1024) {
        document.querySelectorAll('.badge-spacer').forEach(s => s.style.height = '');
        document.querySelectorAll('.section-features').forEach(s => s.style.minHeight = '');
        return;
      }

      const scaled = document.querySelector('.selected-tier');
      if (scaled) scaled.style.transform = 'none';

      document.querySelectorAll('.badge-spacer').forEach(s => s.style.height = '0px');
      document.querySelectorAll('.section-features').forEach(s => s.style.minHeight = '');

      const featureSections = Array.from(document.querySelectorAll('.section-features'));
      const maxFeaturesTop = Math.max(...featureSections.map(s => s.getBoundingClientRect().top));
      featureSections.forEach(section => {
        const diff = maxFeaturesTop - section.getBoundingClientRect().top;
        const spacer = section.parentElement.querySelector('.badge-spacer');
        if (spacer && diff > 0) spacer.style.height = diff + 'px';
      });

      const maxFeaturesHeight = Math.max(...featureSections.map(s => s.offsetHeight));
      featureSections.forEach(s => s.style.minHeight = maxFeaturesHeight + 'px');

      if (scaled) scaled.style.transform = '';
    }
    alignCardSections();
    window.addEventListener('resize', alignCardSections);

    function selectTier(tierName) {
      const pro = document.getElementById('pro-card');
      const ent = document.getElementById('enterprise-card');
      if (tierName === 'pro') {
        pro.classList.replace('unselected-tier', 'selected-tier');
        ent.classList.replace('selected-tier', 'unselected-tier');
      } else {
        ent.classList.replace('unselected-tier', 'selected-tier');
        pro.classList.replace('selected-tier', 'unselected-tier');
      }
      alignCardSections();
    }

    function revealForm(tier) {
      selectTier(tier);

      const label = tier === 'pro' ? 'Pro' : 'Enterprise';
      document.getElementById('form-title').textContent = 'Join the ' + label + ' Waitlist';
      document.getElementById('submit-btn').textContent = 'Join ' + label + ' Waitlist';
      document.getElementById('tier-field').value = tier;

      document.querySelector('.wl-section').classList.add('form-open');

      const panel = document.getElementById('form-panel');
      const emailInput = document.querySelector('#waitlist-form input[type="email"]');

      const panelNaturalHeight = panel.scrollHeight;

      const spacer = document.createElement('div');
      spacer.style.height = panelNaturalHeight + 'px';
      panel.after(spacer);

      panel.style.maxHeight = (panelNaturalHeight + 50) + 'px';

      const panelTop = panel.getBoundingClientRect().top + window.scrollY;
      const targetScrollY = panelTop + panelNaturalHeight / 2 - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(0, targetScrollY), behavior: 'smooth' });
      setTimeout(() => emailInput.focus({ preventScroll: true }), 700);

      panel.addEventListener('transitionend', () => spacer.remove(), { once: true });
    }

    document.getElementById("waitlist-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!turnstileVerified) {
            // TODO uncomment before launch
            alert("Please complete the CAPTCHA first.");
            return;
        }

        const form = e.target;
        const button = form.querySelector("button[type='submit']");
        const formPanel = document.getElementById('form-panel');
        const rowSuccess = document.querySelector(".row-success");
        const rowError = form.querySelector(".row-error");
        const errorText = document.getElementById("error-message");

        button.disabled = true;
        button.innerText = "Submitting...";
        rowError.style.display = "none";

        const formData = new FormData(form);

        try {
            const res = await fetch("https://assets.mailerlite.com/jsonp/2089683/forms/178505401492309060/subscribe", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!res.ok) throw new Error("Network error occurred. Please try again.");

            const json = await res.json();

            if (json.success) {
                formPanel.style.display = "none";
                rowSuccess.style.display = "block";
                const emailInput = form.querySelector('input[name="fields[email]"]');
                const submittedEmailEl = document.getElementById('submitted-email');
                if (emailInput && submittedEmailEl) {
                    submittedEmailEl.textContent = emailInput.value;
                }
            } else {
                let errorMessages = [];
                if (json.errors && json.errors.fields) {
                    Object.keys(json.errors.fields).forEach(field => {
                        const fieldErrors = json.errors.fields[field];
                        errorMessages.push(fieldErrors.join(" "));
                    });
                }
                throw new Error(errorMessages.join(" | ") || "Submission failed.");
            }

        } catch (err) {
            errorText.innerText = err.message;
            rowError.style.display = "block";
            console.error("MailerLite Error:", err);
        } finally {
            button.disabled = false;
            const tier = document.getElementById('tier-field').value;
            const label = tier === 'enterprise' ? 'Enterprise' : 'Pro';
            button.innerText = 'Join ' + label + ' Waitlist';
        }
    });

    // Countdown timer
    (function() {
        const deadline = new Date('2026-06-30T23:59:59').getTime();
        const daysEl = document.getElementById('cd-days');
        const hoursEl = document.getElementById('cd-hours');
        const minsEl = document.getElementById('cd-mins');
        const secsEl = document.getElementById('cd-secs');

        function pad(n) { return n < 10 ? '0' + n : n; }

        function tick() {
            const now = Date.now();
            const diff = deadline - now;
            if (diff <= 0) {
                document.querySelector('.wl-countdown').innerHTML =
                    '<p class="countdown-label">Waitlist is closed</p>';
                return;
            }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            daysEl.textContent = pad(d);
            hoursEl.textContent = pad(h);
            minsEl.textContent = pad(m);
            secsEl.textContent = pad(s);
        }
        tick();
        setInterval(tick, 1000);
    })();
</script>
