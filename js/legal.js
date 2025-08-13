// Логика для страницы юридической справки: загрузка данных, поиск, фильтры и модалка
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const filterSystem = document.getElementById('filter-system');
  const filterSoftware = document.getElementById('filter-software');
  const filterBusiness = document.getElementById('filter-business');
  const filterAi = document.getElementById('filter-ai');
  const tableBody = document.querySelector('#countries-table tbody');
  const modal = document.getElementById('modal');
  const modalContent = modal ? modal.querySelector('.modal-content') : null;
  const modalTitle = modal ? modal.querySelector('.modal-title') : null;
  const modalSummary = modal ? modal.querySelector('.modal-summary') : null;
  const modalPatent = modal ? modal.querySelector('.modal-patentability') : null;
  const modalProcedures = modal ? modal.querySelector('.modal-procedures') : null;
  const modalFees = modal ? modal.querySelector('.modal-fees') : null;
  const modalContacts = modal ? modal.querySelector('.modal-contacts') : null;
  const modalLinks = modal ? modal.querySelector('.modal-links') : null;
  const modalClose = modal ? modal.querySelector('.close') : null;

  let countries = [];

  async function load() {
    try {
      const res = await fetch('/data/countries.json');
      const data = await res.json();
      countries = data.countries || [];
      render();
    } catch (err) {
      console.error('Не удалось загрузить данные стран', err);
    }
  }

  function translateSystem(sys) {
    if (sys === 'first_to_file') return 'first-to-file';
    if (sys === 'first_to_invent') return 'first-to-invent';
    return sys;
  }

  function render() {
    tableBody.innerHTML = '';
    const query = searchInput.value.trim().toLowerCase();
    const sys = filterSystem.value;
    const sw = filterSoftware.value;
    const bs = filterBusiness.value;
    const ai = filterAi.value;
    countries
      .filter((c) => {
        if (query && !(c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query))) return false;
        if (sys && c.system !== sys) return false;
        if (sw && c.software_patentability !== sw) return false;
        if (bs && c.business_methods !== bs) return false;
        if (ai && c.ai_algorithms !== ai) return false;
        return true;
      })
      .forEach((c) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${c.code}</td><td>${c.name}</td><td>${translateSystem(c.system)}</td><td>${c.software_patentability}</td><td>${c.business_methods}</td><td>${c.ai_algorithms}</td>`;
        tr.addEventListener('click', () => openModal(c));
        tableBody.appendChild(tr);
      });
  }

  function openModal(country) {
    if (!modal) return;
    modal.classList.remove('hidden');
    if (modalTitle) modalTitle.textContent = `${country.name} (${country.code})`;
    if (modalSummary) modalSummary.textContent = country.summary || '';
    if (modalPatent && Array.isArray(modalPatent)) {
      /* never runs; modalPatent is element; not array */
    }
    if (modalPatent) {
      modalPatent.innerHTML = '';
      const items = [
        { key: 'ПО', value: country.software_patentability },
        { key: 'Бизнес‑методы', value: country.business_methods },
        { key: 'Алгоритмы/ИИ', value: country.ai_algorithms },
      ];
      items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.key}: ${item.value}`;
        modalPatent.appendChild(li);
      });
    }
    if (modalProcedures) {
      const p = country.procedures || {};
      const options = Array.isArray(p.filing_options) ? p.filing_options.join(', ') : '';
      modalProcedures.textContent = `${p.office || ''}, варианты: ${options}, сроки: ${p.timeline_hint || ''}`;
    }
    if (modalFees) {
      modalFees.textContent = country.fees_hint || '';
    }
    if (modalContacts) {
      modalContacts.innerHTML = '';
      (country.contacts || []).forEach((ct) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${ct.agency}</strong>: <a href="tel:${ct.phone}">${ct.phone}</a>, <a href="mailto:${ct.email}">${ct.email}</a><br/>Сайт: <a href="${ct.website}" target="_blank" rel="noopener">${ct.website}</a>`;
        if (ct.address) li.innerHTML += `<br/>Адрес: ${ct.address}`;
        if (ct.hours) li.innerHTML += `<br/>Часы: ${ct.hours}`;
        modalContacts.appendChild(li);
      });
    }
    if (modalLinks) {
      modalLinks.innerHTML = '';
      (country.official_links || []).forEach((link) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${link.url}" target="_blank" rel="noopener">${link.title}</a>`;
        modalLinks.appendChild(li);
      });
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // события
  if (searchInput) searchInput.addEventListener('input', render);
  if (filterSystem) filterSystem.addEventListener('change', render);
  if (filterSoftware) filterSoftware.addEventListener('change', render);
  if (filterBusiness) filterBusiness.addEventListener('change', render);
  if (filterAi) filterAi.addEventListener('change', render);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  load();
});