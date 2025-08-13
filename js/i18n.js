// i18n.js — minimal client-side i18n (EN only)
(function (global) {
  const dict = {
    en: {
      sign_in: "Sign in",
      sign_out: "Sign out",
      idea: "Idea",
      enter_your_idea: "Enter your idea",
      analyze_idea: "Analyze Idea",
      result: "Result",
      disclaimer: "Disclaimer",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      submit: "Submit",
      cancel: "Cancel",
      close: "Close",
      email: "Email",
      password: "Password",
      sign_up: "Sign up",
      sign_in_with: "Sign in with",
      or: "or",
      legal_norms_check: "Legal Norms Check",
      copied: "Copied",
      copy: "Copy",
      create_favicon: "Create favicon",
      generate: "Generate",
      done: "Done",
      refresh: "Refresh",
      check: "Check",
      settings: "Settings",
      save: "Save"
    }
  };
  let current = 'en';
  function t(key) {
    return (dict[current] && dict[current][key]) || key;
  }
  global.i18n = { t, setLocale: (l) => { if (dict[l]) current = l; } };
})(window);
