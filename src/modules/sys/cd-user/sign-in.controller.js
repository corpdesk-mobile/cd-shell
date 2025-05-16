export const ctlSignIn = {
  template() {
    return `
      <div class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>
        <button id="btn-alert" class="cd-button">Click for Alert</button>
        <button id="btn-shell-api" class="cd-button">Click Shell API</button>
        <script type="module">
          setTimeout(() => {
            const alertBtn = document.getElementById('btn-alert');
            const apiBtn = document.getElementById('btn-shell-api');

            alertBtn?.addEventListener('click', () => alert("Hello from cd-user!"));
            apiBtn?.addEventListener('click', () => {
              window.cdShell?.logger?.debug?.("[cd-user] Called shell API logger");
            });
          }, 0);
        </script>
      </div>
    `;
  }
};
