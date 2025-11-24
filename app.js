// app.js - simple logic for demo appointment app

const DOCTORS = [
  {id:1,name:'Dr. Jessy',specialty:'General Surgeon',bio:'Expert in abdominal & emergency surgeries',photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  {id:2,name:'Dr. Heather',specialty:'Orthopedic Surgeon',bio:'Knee & joint replacement specialist',photo: 'https://randomuser.me/api/portraits/women/40.jpg' },
  {id:3,name:'Dr. Danial',specialty:'Pediatrician',bio:'Child health & immunization expert',photo: 'https://randomuser.me/api/portraits/women/41.jpg' },
  {id:4,name:'Dr. James',specialty:'Cardiologist',bio:'Heart care and preventive cardiology',photo: 'https://randomuser.me/api/portraits/men/42.jpg' },
  {id:5,name:'Dr. Monica',specialty:'Dermatologist',bio:'Skin and cosmetic dermatology',photo: 'https://randomuser.me/api/portraits/women/45.jpg' },
  {id:6,name:'Dr. Mathew',specialty:'ENT Specialist',bio:'Ear, nose and throat care',photo: 'https://randomuser.me/api/portraits/men/35.jpg' },
  {id:7,name:'Dr. Lucas',specialty:'Neurologist',bio:'Neurological disorders',photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
  {id:8,name:'Dr. John Smith',specialty:'Family Physician',bio:'General medicine',photo: 'https://randomuser.me/api/portraits/men/30.jpg' }
];

const APPTS_KEY = 'demo_appts_v1';

function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

function loadAppointments(){ 
  try{ return JSON.parse(localStorage.getItem(APPTS_KEY) || '[]') }catch(e){return []}
}
function saveAppointments(list){ localStorage.setItem(APPTS_KEY, JSON.stringify(list)) }

function renderDoctors(){
  const grid = $('#doctorsGrid');
  grid.innerHTML = '';
  DOCTORS.forEach(d=>{
    const el = document.createElement('div');
    el.className = 'doctor';
    el.innerHTML = `
      <img src="${d.photo}" class="doctor-photo" alt="${d.name}">
      <div class="info">
        <h4>${d.name}</h4>
        <div class="small">${d.specialty}</div>
        <p>${d.bio}</p>
      </div>
      <div class="actions">
        <button class="btn ghost" data-id="${d.id}">View</button>
        <button class="btn primary" data-book="${d.id}">Book</button>
      </div>
    `;
    grid.appendChild(el);
  });
  // wire buttons
  $all('[data-book]').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.getAttribute('data-book');
    $('#doctorSelect').value = id;
    location.hash = '#book';
    $('#datetime').focus();
  }));
}

function populateDoctorSelect(){
  const sel = $('#doctorSelect');
  sel.innerHTML = `<option value="">-- select a doctor --</option>`;
  DOCTORS.forEach(d=>{
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = `${d.name} — ${d.specialty}`;
    sel.appendChild(opt);
  });
}

function renderAppointments(){
  const list = loadAppointments();
  const container = $('#appointmentsList');
  if(!list.length){ container.innerHTML = '<div class="card">No appointments yet. Use the form above to book.</div>'; return; }
  container.innerHTML = '';
  list.sort((a,b)=> new Date(a.datetimeISO) - new Date(b.datetimeISO));
  list.forEach(a=>{
    const el = document.createElement('div');
    el.className = 'appt';
    el.innerHTML = `
      <div class="meta">
        <strong>${a.patientName}</strong>
        <div class="small">${a.patientPhone || ''}</div>
        <div style="margin-top:6px">${a.doctorName} • <span class="small">${new Date(a.datetimeISO).toLocaleString()}</span></div>
        ${a.notes? `<div style="margin-top:6px; color:#333">${a.notes}</div>`: ''}
      </div>
      <div class="right">
        <button data-cancel="${a.id}">Cancel</button>
      </div>
    `;
    container.appendChild(el);
  });
  $all('[data-cancel]').forEach(btn=>btn.addEventListener('click', e=>{
    const id = e.currentTarget.getAttribute('data-cancel');
    if(!confirm('Cancel this appointment?')) return;
    const newList = loadAppointments().filter(x=> x.id !== id);
    saveAppointments(newList);
    renderAppointments();
  }));
}

// simple slot check: identical doctorId + identical ISO datetime is considered a conflict
function isSlotAvailable(doctorId, datetimeISO){
  return !loadAppointments().some(a=> a.doctorId == doctorId && a.datetimeISO === datetimeISO);
}

function initForm(){
  const form = $('#bookForm');
  const msg = $('#formMsg');

  form.addEventListener('submit', e=>{
    e.preventDefault();
    msg.textContent = '';
    const patientName = $('#patientName').value.trim();
    const patientPhone = $('#patientPhone').value.trim();
    const doctorId = $('#doctorSelect').value;
    const datetimeVal = $('#datetime').value;
    const notes = $('#notes').value.trim();

    if(!patientName || patientName.length < 2){ msg.textContent = 'Enter a valid patient name (min 2 chars).'; return; }
    if(!doctorId){ msg.textContent = 'Please select a doctor.'; return; }
    if(!datetimeVal){ msg.textContent = 'Please choose date & time.'; return; }

    const dt = new Date(datetimeVal);
    if(isNaN(dt.getTime())){ msg.textContent = 'Invalid date/time.'; return; }
    const iso = dt.toISOString();

    if(!isSlotAvailable(doctorId, iso)){ msg.textContent = 'That slot is already booked for the selected doctor.'; return; }

    const appt = {
      id: String(Date.now()) + Math.random().toString(36).slice(2,7),
      patientName, patientPhone, doctorId: Number(doctorId),
      doctorName: DOCTORS.find(d=>d.id == doctorId).name,
      datetimeISO: iso,
      notes, createdAt: new Date().toISOString()
    };

    const list = loadAppointments();
    list.push(appt);
    saveAppointments(list);
    msg.textContent = 'Appointment booked!';
    msg.style.color = '';
    form.reset();
    renderAppointments();
    location.hash = '#appointments';
  });
}

// initial boot
function boot(){
  renderDoctors();
  populateDoctorSelect();
  renderAppointments();
  initForm();
}

document.addEventListener('DOMContentLoaded', boot);
