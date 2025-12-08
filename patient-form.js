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
          document.addEventListener('DOMContentLoaded', function() {
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
            pwd.addEventListener('input', checkMatch);
            cpwd.addEventListener('input', checkMatch);
          });
 
(function () {
  /* ---------- ELEMENTS ---------- */
  const form          = document.getElementById('patientForm');
  const btnReview     = document.getElementById('btnReview');
  const reviewArea    = document.getElementById('reviewArea');
  const reviewContent = document.getElementById('reviewContent');
  const btnHideReview = document.getElementById('btnHideReview');
  const btnReset      = document.getElementById('btnReset');

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
    const c  = val('city');
    const st = val('state');
    const z  = val('zip') || '00000';
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

 

  // Build “Requested Info” section from your current controls
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
      measles:    yesNo(has('measles')),
      mumps:      yesNo(has('mumps')),        // will be 'N' if you don't have this checkbox
      heartDz:    yesNo(has('heartdisease')), // will be 'N' if not present
      diabetic:   yesNo(has('diabetic')),     // will be 'N' if not present
      covid19:    yesNo(has('covid19')),
      vaccinated
    };
  }

  // Build the model your review renderer will use
  function buildModel() {
    const first = val('firstName');
    const mi    = val('middleinitile');
    const last  = val('lastName');

    const dobStr = val('dob');  // expected MM/DD/YYYY format
    const dob    = mmddyyyyToDate(dobStr);

    const email = val('email');
    const phone = val('phone');

    const username = (val('username') || '').toLowerCase();

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
  function statusPass() { return { cls: 'status-pass',  text: 'pass' }; }
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

  function renderReviewFancy(model) {
    reviewContent.innerHTML = '';
    const tbl = document.createElement('table');
    tbl.className = 'review-table review-mono';

    const rows = [];
    rows.push(['First, MI, Last Name', model.nameLine, statusPass()]);
    rows.push(['Date of Birth',        model.dobStr || '(blank)', validateDOB(model.dob)]);
    rows.push([
      'Email address',
      model.email
        ? `<a href="mailto:${model.email}">${model.email}</a>`
        : '(blank)',
      validateEmail(model.email)
    ]);
    rows.push(['Phone number', model.phone || '(blank)', validatePhone(model.phone)]);

    const addrHtml = model.addressLines.map((l) => l || '').join('<br>');
    rows.push(['Address', addrHtml, validateAddress()]);

    // commit rows to table
    rows.forEach(([label, value, stat]) => {
      const tr  = document.createElement('tr');

      const tdL = document.createElement('td');
      tdL.className = 'review-label';
      tdL.textContent = label;

      const tdV = document.createElement('td');
      tdV.className = 'review-value';
      tdV.innerHTML = value || '<em>(blank)</em>';

      const tdS = document.createElement('td');
      tdS.className = 'review-status ' + (stat?.cls || '');
      tdS.textContent = stat?.text || '';

      tr.appendChild(tdL);
      tr.appendChild(tdV);
      tr.appendChild(tdS);
      tbl.appendChild(tr);
    });

    // SUBHEAD: REQUESTED INFO
    const sub = document.createElement('div');
    sub.className = 'review-subhead';
    sub.textContent = 'REQUESTED INFO';

    // REQUESTED INFO
    const req = model.requested;
    const tbl2 = document.createElement('table');
    tbl2.className = 'review-table review-mono';
    const reqRows = [
      ['Chicken Pox',  req.chickenPox, 'Vaccinated?', req.vaccinated],
      ['Measles',      req.measles,    'Level of Pain indicated', 'SEVERE'], // placeholder
      ['Mumps',        req.mumps,      '', ''],
      ['Heart Disease',req.heartDz,    '', ''],
      ['Diabetic',     req.diabetic,   '', ''],
      ['Covid-19',     req.covid19,    '', ''],
    ];
    reqRows.forEach(([l1, v1, l2, v2]) => {
      const tr = document.createElement('tr');

      const a = document.createElement('td'); a.className = 'review-label'; a.textContent = l1;
      const b = document.createElement('td'); b.className = 'review-value'; b.textContent = v1;

      const c = document.createElement('td'); c.className = 'review-label'; c.textContent = l2;
      const d = document.createElement('td'); d.className = 'review-value'; d.textContent = v2;

      tr.appendChild(a);
      tr.appendChild(b);
      tr.appendChild(c);
      tr.appendChild(d);
      tbl2.appendChild(tr);
    });

    // SYMPTOMS LINE
    const tbl3 = document.createElement('table');
    tbl3.className = 'review-table review-mono';
    {
      const tr = document.createElement('tr');

      const a = document.createElement('td'); a.className = 'review-label'; a.textContent = 'Described Symptoms';
      const b = document.createElement('td'); b.className = 'review-value'; b.innerHTML = model.symptoms || '<texta area block>';
      const c = document.createElement('td'); c.className = 'review-status'; c.textContent = '';

      tr.appendChild(a);
      tr.appendChild(b);
      tr.appendChild(c);
      tbl3.appendChild(tr);
    }

  // Password mask
  function maskPassword() {
    const p = val('password');
    if (!p) return '';
    if (p.length <= 12) return '•'.repeat(p.length);
    return '•'.repeat(12) + ` (+${p.length - 12})`;
  }
    // USERNAME + PASSWORD ROWS
    const tbl4 = document.createElement('table');
    tbl4.className = 'review-table review-mono';
    [
      ['User ID',  model.username ],
      ['Password', `${model.passwordMasked}`],
    ].forEach(([label, value, stat]) => {
      const tr = document.createElement('tr');

      const a = document.createElement('td'); a.className = 'review-label';  a.textContent = label;
      const b = document.createElement('td'); b.className = 'review-value';  b.textContent = value;
      const c = document.createElement('td'); c.className = 'review-status ' + stat.cls; c.textContent = stat.text;

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
    const model = buildModel();
    renderReviewFancy(model);
    showReview();
  });

  if (btnHideReview) {
    btnHideReview.addEventListener('click', hideReview);
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      hideReview();
      reviewContent.innerHTML = '';
    });
  }

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

