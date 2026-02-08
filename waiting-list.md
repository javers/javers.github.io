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

<!--
<script src="https://assets.mailerlite.com/js/universal.js" type="text/javascript"></script>

<script>
    window.ml = function () {
        (window.ml.q = window.ml.q || []).push(arguments)
    }
    ml('account', 2089683);
    ml('initializeEmbeddedForm', '178505401492309060');
    ml('enablePopups', false);
</script>
-->

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
                      method="POST"
                      action="https://dashboard.mailerlite.com/jsonp/2089683/forms/178505401492309060/subscribe"
                      target="_self">
                
                    <div class="ml-form-formContent">
                        <div class="ml-form-fieldRow">
                            <div class="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                                <label>Email</label>
                                <input aria-label="email" aria-required="true" type="email" class="form-control"
                                       name="fields[email]" placeholder="" autocomplete="email">
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
                
                    <div class="cf-turnstile" data-sitekey="0x4AAAAAACY-8HdUj3S60t53" data-callback="onTurnstileSuccess"></div>
                
                    <div class="ml-form-embedSubmit">
                        <button type="submit" class="primary">Subscribe</button>
                        <button disabled="disabled" style="display: none;" type="button" class="loading">
                            <div class="ml-form-embedSubmitLoad"></div>
                            <span class="sr-only">Loading...</span>
                        </button>
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
const form = document.getElementById('ml-form-178505401492309060');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop normal submit
    
    // Get Turnstile token
    const token = document.querySelector('.cf-turnstile iframe')?.contentWindow?.document?.querySelector('input[name="cf-turnstile-response"]')?.value;
    
    if (!token) {
        alert("Please complete the Turnstile captcha");
        return;
    }

    // Send token to Worker
    try {
        const workerResponse = await fetch('https://steep-voice-0584.bwalacik-098.workers.dev/', {
            method: 'POST',
            body: new URLSearchParams({ 'cf-turnstile-response': token })
        });
        const data = await workerResponse.json();

        if (data.ok) {
            // Turnstile passed -> submit to MailerLite Webform
            console.log("Turnstile verification passed");
            form.submit();
        } else {
            alert("Turnstile verification failed. Please try again.");
            console.error(data);
        }
    } catch (err) {
        console.error(err);
        alert("Error verifying captcha. Please try again later.");
    }
});
</script>
