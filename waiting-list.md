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

<script src="https://assets.mailerlite.com/js/universal.js" type="text/javascript"></script>

<script>
    window.ml = function () {
        (window.ml.q = window.ml.q || []).push(arguments)
    }
    ml('account', 2089683);
    ml('initializeEmbeddedForm', '178505401492309060');
    ml('enablePopups', false);
</script>
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
                      action="https://steep-voice-0584.bwalacik-098.workers.dev/"
                      data-code="">
                    <div class="ml-form-formContent">


                        <div class="ml-form-fieldRow ">
                            <div class="ml-field-group ml-field-email ml-validate-email ml-validate-required">

                                <label>Email</label>


                                <!-- input -->
                                <input aria-label="email" aria-required="true" type="email" class="form-control"
                                       data-inputmask="" name="fields[email]" placeholder="" autocomplete="email">
                                <!-- /input -->

                                <!-- textarea -->

                                <!-- /textarea -->

                                <!-- select -->

                                <!-- /select -->

                                <!-- checkboxes -->

                                <!-- /checkboxes -->

                                <!-- radio -->

                                <!-- /radio -->

                                <!-- countries -->

                                <!-- /countries -->


                            </div>
                        </div>
                        <div class="ml-form-fieldRow ml-last-item">
                            <div class="ml-field-group ml-field-pro_feedback ml-validate-required">

                                <label>Feedback</label>


                                <!-- input -->
                                <input aria-label="pro_feedback" aria-required="true" type="text" class="form-control"
                                       data-inputmask="" name="fields[pro_feedback]" placeholder="" autocomplete="">
                                <!-- /input -->

                                <!-- textarea -->

                                <!-- /textarea -->

                                <!-- select -->

                                <!-- /select -->

                                <!-- checkboxes -->

                                <!-- /checkboxes -->

                                <!-- radio -->

                                <!-- /radio -->

                                <!-- countries -->

                                <!-- /countries -->


                            </div>
                        </div>

                    </div>


                    <!-- Privacy policy -->
                    <div class="ml-form-embedPermissions" style="">
                        <div class="ml-form-embedPermissionsContent default privacy-policy">


                            <p>You can unsubscribe anytime. For more details, review our Privacy Policy.</p>


                        </div>
                    </div>
                    <!-- /Privacy policy -->


                    <input type="hidden" name="ml-submit" value="1">

                    <div class="cf-turnstile" data-sitekey="0x4AAAAAACY-8HdUj3S60t53"  data-callback="onTurnstileSuccess"></div>

                    <div class="ml-form-embedSubmit">

                        <button type="submit" class="primary">Subscribe</button>

                        <button disabled="disabled" style="display: none;" type="button" class="loading">
                            <div class="ml-form-embedSubmitLoad"></div>
                            <span class="sr-only">Loading...</span>
                        </button>
                    </div>

                    <input type="hidden" name="cf-turnstile-response" id="cf-turnstile-response">

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
function onTurnstileSuccess(token) {
  var el = document.getElementById('cf-turnstile-response');
  if (el) el.value = token;
  console.log('Turnstile token received and stored.');
  // NOTE: Do NOT auto-submit. Let user click Subscribe button.
}
</script>

<script>
(function() {
  var form = document.getElementById('ml-form-178505401492309060');
  if (!form) return;

  function validateTurnstileTokenOnSubmit(e) {
    var tokenInput = document.getElementById('cf-turnstile-response');
    var token = tokenInput ? tokenInput.value : '';
    
    // Check if token is present and has minimum length (Turnstile tokens are ~100 chars)
    if (!token || token.length < 10) {
      e.preventDefault();
      e.stopImmediatePropagation();
      alert('Please complete the security check (Turnstile) before submitting.');
      
      // Scroll widget into view to help user see it
      try {
        var widget = document.querySelector('.cf-turnstile');
        if (widget) widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (ex) { /* ignore */ }
      
      return false;
    }
    // Token present => allow submission to proceed
  }

  // Use capture=true so this runs early, before other handlers
  form.addEventListener('submit', validateTurnstileTokenOnSubmit, true);
  console.log('Form submit validator installed.');
})();
</script>

<script>
    function ml_webform_success_36704342() {
      var $ = ml_jQuery || jQuery;
      $('.ml-subscribe-form-36704342 .row-success').show();
      $('.ml-subscribe-form-36704342 .row-form').hide();
    }
</script>


<script src="https://groot.mailerlite.com/js/w/webforms.min.js?v95037e5bac78f29ed026832ca21a7c7b"
        type="text/javascript">
</script>
