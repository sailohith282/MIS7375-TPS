// Script to set current date
document.addEventListener('DOMContentLoaded', function () {
  const today = new Date();
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
  ];

  function getOrdinal(n) {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  const dayName = days[today.getDay()];
  const monthName = months[today.getMonth()];
  const dateNum = today.getDate();
  const ordinal = getOrdinal(dateNum);
  const year = today.getFullYear();
  const dateElem = document.getElementById('currentDayDate');

  if (dateElem) {
    dateElem.textContent = `${dayName}, ${monthName} ${dateNum}${ordinal}, ${year}`;
    dateElem.style.color = 'black';
  }
});

// Password match validation
document.addEventListener('DOMContentLoaded', function () {
  var pwd = document.getElementById('password');
  var cpwd = document.getElementById('confirmPassword');
  var msg = document.getElementById('passwordMatchMsg');

  function checkMatch() {
    if (cpwd.value && pwd.value !== cpwd.value) {
      msg.textContent = "Passwords do not match";
      cpwd.setCustomValidity("Passwords do not match");
    } else {
      msg.textContent = "";
      cpwd.setCustomValidity("");
    }
  }

  if (pwd) pwd.addEventListener('input', checkMatch);
  if (cpwd) cpwd.addEventListener('input', checkMatch);
});

(function () {
  /* ---------- ELEMENTS ---------- */
  const form = document.getElementById('patientForm');
  const btnReview = document.getElementById('btnReview');
  const reviewArea = document.getElementById('reviewArea');
  const reviewContent = document.getElementById('reviewContent');
  const btnHideReview = document.getElementById('btnHideReview');
  const btnReset = document.getElementById('btnReset');

  if (!form || !btnReview || !reviewArea || !reviewContent) {
    return;
  }

  function field(id) {
    return document.getElementById(id);
  }

  function val(id) {
    const el = field(id);
    return el ? String(el.value).trim() : '';
  }

  function yesNo(cond) {
    return cond ? 'Y' : 'N';
  }

  function mmddyyyyToDate(s) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s || '').trim());
    if (!m) return null;
    const d = new Date(+m[3], +m[1] - 1, +m[2]);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function yearsAgo(n) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - n);
    return d;
  }

  // currency slider
  function currencyFormat(v) {
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  // Address
  function addressLines() {
    const a1 = val('addr1');
    const a2 = val('addr2');
    const c = val('city');
    const st = val('state');
    const z = val('zip') || '00000';
    const lines = [];
    if (a1) lines.push(a1);
    if (a2) lines.push(a2);
    if (c || st || z) {
      lines.push(`${c ? c : ''}${c && st ? ', ' : ''}${st ? st : ''} ${z}`.trim());
    }
    return lines;
  }

  // SSN mask
  function maskSSN() {
    const el = field('ssn');
    if (!el) return '';
    const s = String(el.value || '').replace(/\D/g, '');
    return s.length >= 4 ? `***-**-${s.slice(-4)}` : '***-**-****';
  }
  function validateSSN() {
    const el = field('ssn');
    if (!el) return;
    const digits = el.value.replace(/\D/g, '');
    if (digits.length !== 9) {
      el.setCustomValidity('SSN must have exactly 9 digits.');
    } else {
      el.setCustomValidity('');
    }
  }

  const ssnEl = field('ssn');
  if (ssnEl) {
    ssnEl.addEventListener('blur', validateSSN);
  }


  // Password mask
  function maskPassword() {
    const p = val('password');
    if (!p) return '';
    if (p.length <= 12) return '•'.repeat(p.length);
    return '•'.repeat(12) + ` (+${p.length - 12})`;
  }

  // Helper to style a td consistently
  function styleCell(td, align) {
    td.style.textAlign = align || 'left';
    td.style.padding = '6px 8px';
    td.style.verticalAlign = 'top';
  }

  // Build "Requested Info" section from your current controls
  function buildRequestedInfo() {
    // Checkboxes
    const hx = Array.from(form.querySelectorAll('input[name="hx"]'));
    const has = (v) => hx.some((x) => x.value === v && x.checked);

    // Vaccinated radios
    const vac = form.querySelector('input[name="vaccinated"]:checked');
    const vaccinated = vac
      ? vac.value === 'Yes'
        ? 'Y'
        : vac.value === 'No'
        ? 'N'
        : vac.value
      : 'No selection';

    return {
      chickenPox: yesNo(has('chickenpox')),
      measles: yesNo(has('measles')),
      mumps: yesNo(has('mumps')),
      heartDz: yesNo(has('heartdisease')),
      diabetic: yesNo(has('diabetic')),
      covid19: yesNo(has('covid19')),
      vaccinated
    };
  }

  // Build the model your review renderer will use
  function buildModel() {
    const first = val('firstName');
    const mi = val('middleinitile');
    const last = val('lastName');

    const dobStr = val('dob'); // expected MM/DD/YYYY format
    const dob = mmddyyyyToDate(dobStr);

    const email = val('email');
    const phone = val('phone');

    const username = (val('username') || '').toLowerCase();
    const usernameInput = field('username');
    if (usernameInput) usernameInput.value = username; // force lowercase in the form

    return {
      nameLine: [first, mi, last].filter(Boolean).join(' ').trim(),
      dobStr,
      dob,
      email,
      phone,
      addressLines: addressLines(),
      symptoms: val('symptoms') || '<texta area block>',
      username,
      passwordMasked: maskPassword(),
      ssnMasked: maskSSN(),
      requested: buildRequestedInfo()
    };
  }

  /* ---------- VALIDATION FOR RIGHT COLUMN STATUS ---------- */
  function statusPass() { return { cls: 'status-pass', text: 'pass' }; }
  function statusErr(t) { return { cls: 'status-error', text: t || 'ERROR' }; }

  function validateDOB(d) {
    if (!d) return statusErr('ERROR: Invalid date');
    const today = new Date();
    if (d > today) return statusErr('ERROR: Cannot be in the future');
    if (d < yearsAgo(120)) return statusErr('ERROR: Too old (>120y)');
    return statusPass();
  }

  function validateEmail(s) {
    return /\S+@\S+\.\S+/.test(s) ? statusPass() : statusErr('ERROR: Invalid email');
  }

  function validatePhone(s) {
    if (!s) return statusPass();
    // Accept (713) 743-7523  OR  713-743-7523  OR  7137437523
    return /^(?:\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10})$/.test(s)
      ? statusPass()
      : statusErr('ERROR: Invalid phone');
  }

  function validateAddress() {
    // Only Zip
    const zipOk = !!val('zip');
    return zipOk ? statusPass() : statusErr('ERROR: Missing Zip Code');
  }

  // New for Assignment 3: username and password checks
  function validateUsernameValue(s) {
    if (!s) return statusErr('ERROR: User ID required');
    if (s.length < 5 || s.length > 20) {
      return statusErr('ERROR: 5–20 chars');
    }
    if (/^\d/.test(s)) {
      return statusErr('ERROR: Cannot start with a number');
    }
    if (!/^[a-z0-9_-]+$/.test(s)) {
      return statusErr('ERROR: Letters, numbers, dash, underscore only');
    }
    return statusPass();
  }

  function validatePasswordPair(p, p2, username) {
    if (!p || !p2) {
      return statusErr('ERROR: Passwords required');
    }
    if (p.length < 8) {
      return statusErr('ERROR: Min length 8');
    }
    if (!/[A-Z]/.test(p) || !/[a-z]/.test(p) || !/\d/.test(p)) {
      return statusErr('ERROR: Need upper, lower, and digit');
    }
    if (username && p.toLowerCase() === username.toLowerCase()) {
      return statusErr('ERROR: Cannot equal user ID');
    }
    if (p !== p2) {
      return statusErr('ERROR: Must match');
    }
    return statusPass();
  }

  function renderReviewFancy(model) {
    reviewContent.innerHTML = '';

    // MAIN table (label, value, status)
    const tbl = document.createElement('table');
    tbl.className = 'review-table review-mono';
    tbl.style.width = '100%';
    tbl.style.borderCollapse = 'collapse';

    // define column widths for clarity: label | value | status
    const cg = document.createElement('colgroup');
    const c1 = document.createElement('col'); c1.style.width = '40%';
    const c2 = document.createElement('col'); c2.style.width = '50%';
    const c3 = document.createElement('col'); c3.style.width = '10%';
    cg.appendChild(c1); cg.appendChild(c2); cg.appendChild(c3);
    tbl.appendChild(cg);

    const rows = [];
    rows.push(['First, MI, Last Name', model.nameLine, statusPass()]);
    rows.push(['Date of Birth', model.dobStr || '(blank)', validateDOB(model.dob)]);
    rows.push([
      'Email address',
      model.email ? `<a href="mailto:${model.email}">${model.email}</a>` : '(blank)',
      validateEmail(model.email)
    ]);
    rows.push(['Phone number', model.phone || '(blank)', validatePhone(model.phone)]);

    const addrHtml = model.addressLines.map((l) => l || '').join('<br>');
    rows.push(['Address', addrHtml, validateAddress()]);

    // commit rows to table
    rows.forEach(([label, value, stat]) => {
      const tr = document.createElement('tr');

      const tdL = document.createElement('td');
      tdL.className = 'review-label';
      tdL.textContent = label;
      styleCell(tdL, 'right');

      const tdV = document.createElement('td');
      tdV.className = 'review-value';
      tdV.innerHTML = value || '<em>(blank)</em>';
      styleCell(tdV, 'left');

      const tdS = document.createElement('td');
      tdS.className = 'review-status ' + (stat?.cls || '');
      tdS.textContent = stat?.text || '';
      styleCell(tdS, 'center');

      tr.appendChild(tdL);
      tr.appendChild(tdV);
      tr.appendChild(tdS);
      tbl.appendChild(tr);
    });

    // SUBHEAD: REQUESTED INFO
    const sub = document.createElement('div');
    sub.className = 'review-subhead';
    sub.textContent = 'REQUESTED INFO';
    sub.style.marginTop = '12px';
    sub.style.fontWeight = '600';

    // REQUESTED INFO (4-column table)
    const req = model.requested;
    const tbl2 = document.createElement('table');
    tbl2.className = 'review-table review-mono';
    tbl2.style.width = '100%';
    tbl2.style.borderCollapse = 'collapse';
    const cg2 = document.createElement('colgroup');
    const rc1 = document.createElement('col'); rc1.style.width = '30%';
    const rc2 = document.createElement('col'); rc2.style.width = '25%';
    const rc3 = document.createElement('col'); rc3.style.width = '30%';
    const rc4 = document.createElement('col'); rc4.style.width = '15%';
    cg2.appendChild(rc1); cg2.appendChild(rc2); cg2.appendChild(rc3); cg2.appendChild(rc4);
    tbl2.appendChild(cg2);

    const reqRows = [
      ['Chicken Pox', req.chickenPox, 'Vaccinated?', req.vaccinated],
      ['Measles', req.measles, 'Level of Pain indicated', 'SEVERE'],
      ['Mumps', req.mumps, '', ''],
      ['Heart Disease', req.heartDz, '', ''],
      ['Diabetic', req.diabetic, '', ''],
      ['Covid-19', req.covid19, '', '']
    ];
    reqRows.forEach(([l1, v1, l2, v2]) => {
      const tr = document.createElement('tr');

      const a = document.createElement('td'); a.className = 'review-label'; a.textContent = l1;
      styleCell(a, 'right');

      const b = document.createElement('td'); b.className = 'review-value'; b.textContent = v1;
      styleCell(b, 'center');

      const c = document.createElement('td'); c.className = 'review-label'; c.textContent = l2;
      styleCell(c, 'right');

      const d = document.createElement('td'); d.className = 'review-value'; d.textContent = v2;
      styleCell(d, 'center');

      tr.appendChild(a);
      tr.appendChild(b);
      tr.appendChild(c);
      tr.appendChild(d);
      tbl2.appendChild(tr);
    });

    // SYMPTOMS LINE
    const tbl3 = document.createElement('table');
    tbl3.className = 'review-table review-mono';
    tbl3.style.width = '100%';
    tbl3.style.borderCollapse = 'collapse';
    const cg3 = document.createElement('colgroup');
    const t3c1 = document.createElement('col'); t3c1.style.width = '30%';
    const t3c2 = document.createElement('col'); t3c2.style.width = '60%';
    const t3c3 = document.createElement('col'); t3c3.style.width = '10%';
    cg3.appendChild(t3c1); cg3.appendChild(t3c2); cg3.appendChild(t3c3);
    tbl3.appendChild(cg3);

    {
      const tr = document.createElement('tr');

      const a = document.createElement('td'); a.className = 'review-label'; a.textContent = 'Described Symptoms';
      styleCell(a, 'right');

      const b = document.createElement('td'); b.className = 'review-value'; b.innerHTML = model.symptoms || '<texta area block>';
      styleCell(b, 'left');

      const c = document.createElement('td'); c.className = 'review-status'; c.textContent = '';
      styleCell(c, 'center');

      tr.appendChild(a);
      tr.appendChild(b);
      tr.appendChild(c);
      tbl3.appendChild(tr);
    }

    // USERNAME + PASSWORD ROWS
    const model2 = buildModel();
    const userStatus = validateUsernameValue(model2.username);
    const passStatus = validatePasswordPair(
      val('password'),
      val('confirmPassword'),
      model2.username
    );

    const tbl4 = document.createElement('table');
    tbl4.className = 'review-table review-mono';
    tbl4.style.width = '100%';
    tbl4.style.borderCollapse = 'collapse';
    const cg4 = document.createElement('colgroup');
    const f1 = document.createElement('col'); f1.style.width = '40%';
    const f2 = document.createElement('col'); f2.style.width = '50%';
    const f3 = document.createElement('col'); f3.style.width = '10%';
    cg4.appendChild(f1); cg4.appendChild(f2); cg4.appendChild(f3);
    tbl4.appendChild(cg4);

    [
      ['User ID', model2.username, userStatus],
      ['Password', `${model2.passwordMasked}`, passStatus]
    ].forEach(([label, value, stat]) => {
      const tr = document.createElement('tr');

      const a = document.createElement('td'); a.className = 'review-label'; a.textContent = label;
      styleCell(a, 'right');

      const b = document.createElement('td'); b.className = 'review-value'; b.textContent = value;
      styleCell(b, 'left');

      const c = document.createElement('td'); c.className = 'review-status ' + stat.cls; c.textContent = stat.text;
      styleCell(c, 'center');

      tr.appendChild(a);
      tr.appendChild(b);
      tr.appendChild(c);
      tbl4.appendChild(tr);
    });

    // Append everything in order
    reviewContent.appendChild(tbl);
    reviewContent.appendChild(sub);
    reviewContent.appendChild(tbl2);
    reviewContent.appendChild(tbl3);
    reviewContent.appendChild(tbl4);
  }

  // Assignment 3: run key validations before showing review / submitting
  function runAllValidations() {
    const model = buildModel();
    let ok = true;

    // DOB
    const dobStatus = validateDOB(model.dob);
    const dobInput = field('dob');
    if (dobStatus.cls === 'status-error') {
      if (dobInput) dobInput.setCustomValidity(dobStatus.text);
      ok = false;
    } else if (dobInput) {
      dobInput.setCustomValidity('');
    }

    // Email
    const emailStatus = validateEmail(model.email);
    const emailInput = field('email');
    if (emailStatus.cls === 'status-error') {
      if (emailInput) emailInput.setCustomValidity(emailStatus.text);
      ok = false;
    } else if (emailInput) {
      emailInput.setCustomValidity('');
    }

    // Phone
    const phoneStatus = validatePhone(model.phone);
    const phoneInput = field('phone');
    if (phoneStatus.cls === 'status-error') {
      if (phoneInput) phoneInput.setCustomValidity(phoneStatus.text);
      ok = false;
    } else if (phoneInput) {
      phoneInput.setCustomValidity('');
    }

    // Address / ZIP (you already treat ZIP as required in validateAddress)
    const addrStatus = validateAddress();
    const zipInput = field('zip');
    if (addrStatus.cls === 'status-error') {
      if (zipInput) zipInput.setCustomValidity(addrStatus.text);
      ok = false;
    } else if (zipInput) {
      zipInput.setCustomValidity('');
    }

    // Username + password
    const userStatus = validateUsernameValue(model.username);
    const passStatus = validatePasswordPair(
      val('password'),
      val('confirmPassword'),
      model.username
    );
    const userInput = field('username');
    const passInput = field('password');
    const cpInput = field('confirmPassword');

    if (userStatus.cls === 'status-error') {
      if (userInput) userInput.setCustomValidity(userStatus.text);
      ok = false;
    } else if (userInput) {
      userInput.setCustomValidity('');
    }

    if (passStatus.cls === 'status-error') {
      if (passInput) passInput.setCustomValidity(passStatus.text);
      if (cpInput) cpInput.setCustomValidity(passStatus.text);
      ok = false;
    } else {
      if (passInput) passInput.setCustomValidity('');
      if (cpInput) cpInput.setCustomValidity('');
    }

    return ok;
  }

  /* ---------- SHOW/HIDE ---------- */
  function showReview() {
    reviewArea.hidden = false;
    reviewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideReview() {
    reviewArea.hidden = true;
  }

  /* ---------- EVENTS ---------- */
  btnReview.addEventListener('click', () => {
    const allGood = runAllValidations(); // run checks first
    const model = buildModel();
    renderReviewFancy(model);
    showReview();
    if (!allGood) {
      // If there are errors, jump focus to first invalid control
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
    }
  });

  form.addEventListener('submit', function (evt) {
    const allGood = runAllValidations(); // same exact name
    if (!allGood) {
      evt.preventDefault();
      alert('Please fix the fields marked in error before submitting.');
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
    }
  });
  const btnValidate = document.getElementById('btnValidate');

  if (btnValidate) {
    btnValidate.addEventListener('click', () => {
      const allGood = runAllValidations();
      if (!allGood) {
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
      } else {
        alert('All required fields look good.');
      }
    });
  }


  if (btnHideReview) {
    btnHideReview.addEventListener('click', hideReview);
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      hideReview();
      reviewContent.innerHTML = '';
    });
  }

  ['dob', 'email', 'phone', 'zip', 'username', 'password', 'confirmPassword']
    .forEach((id) => {
      const el = field(id);
      if (el) {
        el.addEventListener('blur', () => {
          runAllValidations();
        });
      }
    });

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t && t.type === 'range') {
      const outId = t.getAttribute('data-output');
      if (outId) {
        const out = document.getElementById(outId);
        if (out) {
          const val = t.dataset.format === 'currency' ? currencyFormat(t.value) : t.value;
          out.textContent = val;
        }
      }
    }
  });
})();