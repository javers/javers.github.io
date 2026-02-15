---
layout: page
title: Subscribe to JaVers Pro Waitlist
category: Contact
---

<style>
    .ml-form-embedContainer{height:99.99%}
    .ml-form-align-center {
        text-align: center;
        display: table-cell;
        vertical-align: middle;
    }
</style>


<style type="text/css">@import url("https://assets.mlcdn.com/fonts.css?version=1770279");</style>

<link rel="stylesheet" href="css/waiting-list-form.css">

<div id="mlb2-36704342" class="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-36704342">
    <div class="ml-form-align-center ">
        <div class="ml-form-embedWrapper embedForm">


            <div class="ml-form-embedBody ml-form-embedBodyDefault row-form">

                <div class="ml-form-embedContent" style=" ">

                    <h4>Newsletter</h4>

                    <p>Signup for news and special offers!</p>


                </div>


                <form id="ml-form-178505401492309060" 
                      class="ml-block-form"
                      data-code="">

                    <div class="ml-form-formContent">
                        <div class="ml-form-fieldRow">
                            <div class="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                                <label>Email</label>
                                <input aria-label="email" aria-required="true" type="email" class="form-control"
                                       name="fields[email]" placeholder="" autocomplete="email" required>
                            </div>
                        </div>
                        <div class="ml-form-fieldRow ml-last-item">
                            <div class="ml-field-group ml-field-pro_feedback ml-validate-required">
                                <label>Feedback</label>
                                <input aria-label="pro_feedback" aria-required="true" type="text" class="form-control"
                                       name="fields[pro_feedback]" placeholder="" autocomplete="">
                            </div>
                        </div>
                    </div>
                
                    <!-- Privacy policy -->
                    <div>
                        <div class="privacy_policy_div">
                            <p>
                            The information you provide on this form will only be used to provide you with
                            updates related to
                            JaVers Pro Waiting List.
                            We will not share your information with any third parties.
                            </p>
                            <p>You can unsubscribe anytime. For more details, review our <a href="/waiting-list-privacy-policy">Privacy Policy</a>.
                            </p>

                        </div>
                    </div>
                    <!-- /Privacy policy -->


                    <div class="cf-turnstile" data-sitekey="0x4AAAAAACY-8HdUj3S60t53" data-callback="onTurnstileSuccess"></div>
               
                    <div class="ml-form-errorBody row-error" style="display: none">
                        <div class="ml-form-errorContent">
                            <h4>Something went wrong</h4>
                            <p id="error-message">Please try again later.</p>
                        </div>
                    </div>

                    <div class="ml-form-embedSubmit">
                        <button type="submit" class="primary">Subscribe</button>

                    </div>
                
                    <input type="hidden" name="anticsrf" value="true">
                </form>
            </div>

            <div class="ml-form-successBody row-success" style="display: none">
                <div class="ml-form-successContent">
                    <h4>Thank you!</h4>
                    <p>Please confirm your email address</p>
                </div>
            </div>

        </div>
    </div>
</div>


<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<script>
let turnstileVerified = false;

function onTurnstileSuccess(token) {
  // Send token to worker for verification
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
    // Worker verified token successfully
    turnstileVerified = true;
    console.log("turnstile verified")
  })
  .catch(err => {
    console.error(err);
    alert("Turnstile verification failed. Please try again.");
  });
}

document.getElementById("ml-form-178505401492309060").addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Validation & UI Reset
    if (!turnstileVerified) {
        alert("Please complete the CAPTCHA first.");
        return;
    }

    const form = e.target;
    const button = form.querySelector("button");
    const rowForm = document.querySelector(".row-form");
    const rowSuccess = document.querySelector(".row-success");
    const rowError = document.querySelector(".row-error");
    const errorText = document.getElementById("error-message");

    button.disabled = true;
    button.innerText = "Submitting...";
    rowError.style.display = "none";

    // 2. Prepare Data
    const formData = new FormData(form);

    try {
        // Use the assets domain which handles AJAX/CORS better than the dashboard domain
        const res = await fetch("https://assets.mailerlite.com/jsonp/2089683/forms/178505401492309060/subscribe", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) throw new Error("Network error occurred. Please try again.");

        const json = await res.json();

        // 3. Handle Response
        if (json.success) {
            rowForm.style.display = "none";
            rowSuccess.style.display = "block";
            rowError.style.display = "none";
        } else {
            // Extract messages from: {"errors":{"fields":{"email":["The email field..."]}}}
            let errorMessages = [];
            
            if (json.errors && json.errors.fields) {
                Object.keys(json.errors.fields).forEach(field => {
                    const fieldErrors = json.errors.fields[field]; // This is the array
                    errorMessages.push(fieldErrors.join(" "));   // Join array strings
                });
            }

            throw new Error(errorMessages.join(" | ") || "Submission failed.");
        }

    } catch (err) {
        // 4. Handle Failure
        errorText.innerText = err.message;
        rowError.style.display = "block";
        console.error("MailerLite Error:", err);
    } finally {
        button.disabled = false;
        button.innerText = "Subscribe";
    }
});

</script>
