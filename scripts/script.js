let data = {
            ptoTotal: 20,
            holidays: [
                { date: '2026-01-01', name: "New Year's Day" },
                { date: '2026-01-19', name: 'MLK Day' },
                { date: '2026-02-16', name: "Presidents' Day" },
                { date: '2026-05-25', name: 'Memorial Day' },
                { date: '2026-07-03', name: 'Independence Day (observed)' },
                { date: '2026-09-07', name: 'Labor Day' },
                { date: '2026-11-26', name: 'Thanksgiving' },
                { date: '2026-11-27', name: 'Day after Thanksgiving' },
                { date: '2026-12-25', name: 'Christmas' }
            ],
            ptoRequests: [
                { id: 1, startDate: '2026-02-14', endDate: '2026-02-14', halfDay: false, status: 'approved', title: 'Valentine\'s Day Off', note: '' },
                { id: 2, startDate: '2026-03-20', endDate: '2026-03-20', halfDay: true, status: 'approved', title: 'Doctor Appointment', note: 'Annual checkup' },
                { id: 3, startDate: '2026-06-26', endDate: '2026-06-26', halfDay: false, status: 'submitted', title: 'Beach Trip', note: '' }
            ],
            notes: {},
            cardSettings: {
                showNextWeekend: true,
                showNextHoliday: true,
                showNextNote: true,
                showNextPTO: true
            }
        };
let quillEditor = null;
        // Load data from localStorage
        function loadData() {
            const saved = localStorage.getItem('timeOffData');
            if (saved) {
                data = JSON.parse(saved);
            }
        }

        // Save data to localStorage
        function saveData() {
            localStorage.setItem('timeOffData', JSON.stringify(data));
        }

        // Initialize
        loadData();

        // View switching
        function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(viewName).classList.add('active');
    event.target.classList.add('active');
    
    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'calendar') renderCalendar();
    if (viewName === 'notes') renderNotes();
    if (viewName === 'settings') renderSettings();
}

        // Calculate PTO stats
        function calculatePTOStats() {
            const today = new Date();
            let approved = 0, submitted = 0, used = 0;

            data.ptoRequests.forEach(pto => {
                const start = new Date(pto.startDate);
                const end = new Date(pto.endDate);
                const days = pto.halfDay ? 0.5 : Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                
                if (pto.status === 'approved') approved += days;
                if (pto.status === 'submitted') submitted += days;
                if (pto.status === 'used') used += days;
            });

            return {
                total: data.ptoTotal,
                approved,
                submitted,
                used,
                remaining: data.ptoTotal - approved - used,
                pending: submitted
            };
        }

        // Calculate days between dates
        function daysBetween(date1, date2) {
            const diff = Math.abs(date2 - date1);
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        // Get next weekend
        function getNextWeekend() {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
            const nextWeekend = new Date(today);
            nextWeekend.setDate(today.getDate() + daysUntilSaturday);
            return nextWeekend;
        }

        // Get next holiday
        function getNextHoliday() {
            const today = new Date();
            return data.holidays.find(h => new Date(h.date) >= today);
        }

        // Render dashboard
        function renderDashboard() {
    const stats = calculatePTOStats();
    const nextWeekend = getNextWeekend();
    const nextHoliday = getNextHoliday();
    const nextNote = getNextNote();
    const nextPTO = getNextPTO();
    
    const statsHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background: #dbeafe; color: #1e40af;">📅</div>
            <div class="stat-value">${stats.total + data.holidays.length}</div>
            <div class="stat-label">Total Days Off</div>
            <div class="stat-sublabel">Available this year</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: #d1fae5; color: #065f46;">📅</div>
            <div class="stat-value">${stats.remaining}</div>
            <div class="stat-label">PTO Days Remaining</div>
            <div class="stat-sublabel">${stats.used} used, ${stats.approved} approved</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: #fef3c7; color: #92400e;">☀️</div>
            <div class="stat-value">${data.holidays.length}</div>
            <div class="stat-label">Public Holidays</div>
            <div class="stat-sublabel">Company holidays</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: #e0e7ff; color: #4f46e5;">📝</div>
            <div class="stat-value">${Object.keys(data.notes || {}).length}</div>
            <div class="stat-label">Total Notes</div>
            <div class="stat-sublabel">Saved notes</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: #fce7f3; color: #9f1239;">🎯</div>
            <div class="stat-value">${stats.pending}</div>
            <div class="stat-label">Pending PTO</div>
            <div class="stat-sublabel">Awaiting approval</div>
        </div>
    `;
    
    document.getElementById('statsGrid').innerHTML = statsHTML;
    
    // Render countdown cards
    let countdownHTML = '';
    
    if (data.cardSettings.showNextWeekend) {
        countdownHTML += `
            <div class="stat-card">
                <div class="stat-icon" style="background: #dbeafe; color: #0284c7;">⏰</div>
                <div class="stat-value">${daysBetween(new Date(), nextWeekend)}</div>
                <div class="stat-label">Days to Weekend</div>
                <div class="stat-sublabel">${nextWeekend.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
        `;
    }
    
    if (data.cardSettings.showNextHoliday && nextHoliday) {
        countdownHTML += `
            <div class="stat-card">
                <div class="stat-icon" style="background: #fef3c7; color: #92400e;">🎉</div>
                <div class="stat-value">${daysBetween(new Date(), new Date(nextHoliday.date))}</div>
                <div class="stat-label">Next Holiday</div>
                <div class="stat-sublabel">${nextHoliday.name}</div>
            </div>
        `;
    }
    
    if (data.cardSettings.showNextNote && nextNote) {
        const [year, month, day] = nextNote.date.split('-').map(Number);
        const noteDate = new Date(year, month - 1, day);
        countdownHTML += `
            <div class="stat-card">
                <div class="stat-icon" style="background: #e0e7ff; color: #4f46e5;">📝</div>
                <div class="stat-value">${daysBetween(new Date(), noteDate)}</div>
                <div class="stat-label">Next Note</div>
                <div class="stat-sublabel">
                ${nextNote.note.note}
                <br>
                ${noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
        `;
    }
    
    if (data.cardSettings.showNextPTO && nextPTO) {
        const [year, month, day] = nextPTO.startDate.split('-').map(Number);
        const ptoDate = new Date(year, month - 1, day);
        countdownHTML += `
            <div class="stat-card">
                <div class="stat-icon" style="background: #fce7f3; color: #9f1239;">🏖️</div>
                <div class="stat-value">${daysBetween(new Date(), ptoDate)}</div>
                <div class="stat-label">Next PTO</div>
                <div class="stat-sublabel">${nextPTO.title || 'PTO'}</div>
            </div>
        `;
    }
    
    // Add countdown section if there are any cards to show
    if (countdownHTML) {
        const countdownSection = document.getElementById('countdownSection') || createCountdownSection();
        countdownSection.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-900 mb-4" style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Upcoming</h2>
            <div class="countdown-grid">${countdownHTML}</div>
        `;
    } else {
        const countdownSection = document.getElementById('countdownSection');
        if (countdownSection) countdownSection.innerHTML = '';
    }
    
    renderPTOList();
}

function createCountdownSection() {
    const section = document.createElement('div');
    section.id = 'countdownSection';
    section.style.marginBottom = '2rem';
    const ptoSection = document.querySelector('.form-section');
    ptoSection.parentNode.insertBefore(section, ptoSection);
    return section;
}

        // Render PTO list
        function renderPTOList() {
            const html = data.ptoRequests.map(pto => {
                        const [startYear, startMonth, startDay] = pto.startDate.split('-').map(Number);
const [endYear, endMonth, endDay] = pto.endDate.split('-').map(Number);
const start = new Date(startYear, startMonth - 1, startDay);
const end = new Date(endYear, endMonth - 1, endDay);
                const days = pto.halfDay ? 0.5 : Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                
                return `<div class="pto-item">
        <div class="pto-info">
            <div>
                <div class="pto-dates">
                    <strong>${pto.title || 'PTO'}</strong> - 
                    ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    ${pto.startDate !== pto.endDate ? ` - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                </div>
                <div class="pto-days">${days} ${days === 1 ? 'day' : 'days'}${pto.halfDay ? ' (half day)' : ''}${pto.note ? ' - ' + pto.note : ''}</div>
            </div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <select class="status-badge status-${pto.status}" onchange="updatePTOStatus(${pto.id}, this.value)">
                <option value="static" ${pto.status === 'static' ? 'selected' : ''}>Static</option>
                <option value="submitted" ${pto.status === 'submitted' ? 'selected' : ''}>Submitted</option>
                <option value="approved" ${pto.status === 'approved' ? 'selected' : ''}>Approved</option>
                <option value="used" ${pto.status === 'used' ? 'selected' : ''}>Used</option>
            </select>
            <button class="btn btn-secondary btn-sm" onclick="deletePTO(${pto.id})">Delete</button>
        </div>
    </div>`;
            }).join('');

            document.getElementById('ptoList').innerHTML = html || '<p style="text-align: center; color: #64748b;">No PTO requests yet</p>';
        }

        // Update PTO status
        function updatePTOStatus(id, status) {
            const pto = data.ptoRequests.find(p => p.id === id);
            if (pto) {
                pto.status = status;
                saveData();
                renderDashboard();
            }
        }

        // Delete PTO
        function deletePTO(id) {
            if (confirm('Are you sure you want to delete this PTO request?')) {
                data.ptoRequests = data.ptoRequests.filter(p => p.id !== id);
                saveData();
                renderDashboard();
            }
        }

        // Render calendar
        function renderCalendar() {
            const monthsHTML = [];
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            
            for (let month = 0; month < 12; month++) {
                        
                       const monthHolidays = data.holidays.filter(h => {
    const [hYear, hMonth] = h.date.split('-').map(Number);
    return hMonth === (month + 1);
}).map(h => h.name).join(', ');

                monthsHTML.push(`
                    <div class="month-card">
                        <div class="month-header">${monthNames[month]} 2026</div>
                        <div class="month-holidays">${monthHolidays ? 'Holidays: ' + monthHolidays : ''}</div>
                        <div class="calendar-grid">
                            <div class="day-label">Sun</div>
                            <div class="day-label">Mon</div>
                            <div class="day-label">Tue</div>
                            <div class="day-label">Wed</div>
                            <div class="day-label">Thu</div>
                            <div class="day-label">Fri</div>
                            <div class="day-label">Sat</div>
                            ${generateMonthDays(month, 2026)}
                        </div>
                    </div>
                `);
            }

            document.getElementById('monthsGrid').innerHTML = monthsHTML.join('');
        }

        // Generate calendar days
        function generateMonthDays(month, year) {
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            let html = '';

            // Empty cells
            for (let i = 0; i < firstDay; i++) {
                html += '<div class="day empty"></div>';
            }

            // Days
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        
                const dayOfWeek = date.getDay();
                
                let className = 'day';
                
                // Check if weekend
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    className += ' weekend';
                }
                
                // Check if holiday
                const isHoliday = data.holidays.find(h => {
    const [hYear, hMonth, hDay] = h.date.split('-').map(Number);
    return hYear === year && hMonth === (month + 1) && hDay === day;
});  
                        if (isHoliday) {
                    className += ' holiday';
                }
                
                
// Check if PTO
const isPTO = data.ptoRequests.find(p => {
    const [startYear, startMonth, startDay] = p.startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = p.endDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    const current = new Date(year, month, day);
    
    return current >= start && current <= end;
});
if (isPTO) {
    className += ' pto-' + isPTO.status;
}

// Check if today
const today = new Date();
if (date.getDate() === today.getDate() && 
    date.getMonth() === today.getMonth() && 
    date.getFullYear() === today.getFullYear()) {
    className += ' today';
}
                        // Check if has note
const noteKey = dateStr;
if (data.notes && data.notes[noteKey]) {
    if (data.notes[noteKey].note) {
        className += ' has-note';
    }
    if (data.notes[noteKey].important) {
        className += ' important';
    }
}

// Update the HTML generation to include click handler:
html += `<div class="${className}" onclick="openNoteModal('${dateStr}')">${day}</div>`;
            }

            return html;
        }

        // Render settings
        function renderSettings() {
    document.getElementById('ptoDaysInput').value = data.ptoTotal;
    
    // Set toggle states
    if (!data.cardSettings) {
        data.cardSettings = {
            showNextWeekend: true,
            showNextHoliday: true,
            showNextNote: true,
            showNextPTO: true
        };
    }
    
    document.getElementById('toggleNextWeekend').checked = data.cardSettings.showNextWeekend;
    document.getElementById('toggleNextHoliday').checked = data.cardSettings.showNextHoliday;
    document.getElementById('toggleNextNote').checked = data.cardSettings.showNextNote;
    document.getElementById('toggleNextPTO').checked = data.cardSettings.showNextPTO;
    
    renderHolidayList();
}

        
        // Render holiday list
        function renderHolidayList() {
                    const html = data.holidays.map((holiday, index) => {
    const [year, month, day] = holiday.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return `
        <div class="holiday-item">
            <div class="holiday-info">
                <div class="holiday-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div class="holiday-name">${holiday.name}</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="deleteHoliday(${index})">Delete</button>
        </div>
    `;
}).join('');
                    
                    
            document.getElementById('holidayList').innerHTML = html || '<p style="text-align: center; color: #64748b;">No holidays added yet</p>';
                    
                    
        }

        // Save PTO days
        function savePTODays() {
            const value = parseInt(document.getElementById('ptoDaysInput').value);
            if (value && value > 0) {
                data.ptoTotal = value;
                saveData();
                alert('PTO days saved successfully!');
                renderDashboard();
            } else {
                alert('Please enter a valid number of PTO days');
            }
        }

        function renderNotes() {
    filterNotes();
}

        function filterNotes() {
    const searchTerm = document.getElementById('noteSearch').value.toLowerCase();
    const showPast = document.getElementById('filterPast').checked;
    const showImportant = document.getElementById('filterImportant').checked;
    const showHolidays = document.getElementById('filterHolidays').checked;
    const showPTO = document.getElementById('filterPTO').checked;
    const showRegular = document.getElementById('filterRegular').checked;
    
    if (!data.notes) {
        document.getElementById('notesGrid').innerHTML = '<p style="text-align: center; color: #64748b;">No notes yet</p>';
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const noteEntries = Object.entries(data.notes)
        .map(([dateStr, noteData]) => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            
            // Get associated data
            const holiday = data.holidays.find(h => h.date === dateStr);
            const pto = data.ptoRequests.find(p => {
                const [startYear, startMonth, startDay] = p.startDate.split('-').map(Number);
                const [endYear, endMonth, endDay] = p.endDate.split('-').map(Number);
                const start = new Date(startYear, startMonth - 1, startDay);
                const end = new Date(endYear, endMonth - 1, endDay);
                const current = new Date(year, month - 1, day);
                return current >= start && current <= end;
            });
            
            return { dateStr, date, noteData, holiday, pto };
        })
        .filter(item => {
            // Filter by past/future
            if (!showPast && item.date < today) {
                return false;
            }
            
            // Filter by search term (strip HTML tags for search)
            if (searchTerm) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.noteData.note;
                const plainText = tempDiv.textContent || tempDiv.innerText || '';
                if (!plainText.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }
            
            // Filter by type
            const isImportant = item.noteData.important;
            const isHoliday = !!item.holiday;
            const isPTO = !!item.pto;
            const isRegular = !isImportant && !isHoliday && !isPTO;
            
            if (isImportant && !showImportant) return false;
            if (isHoliday && !showHolidays) return false;
            if (isPTO && !showPTO) return false;
            if (isRegular && !showRegular) return false;
            
            return true;
        })
        .sort((a, b) => a.date - b.date);
    
    if (noteEntries.length === 0) {
        document.getElementById('notesGrid').innerHTML = '<p style="text-align: center; color: #64748b;">No notes match your filters</p>';
        return;
    }
    
    const html = noteEntries.map(item => {
        const badges = [];
        if (item.noteData.important) badges.push('<span class="note-badge note-badge-important">⭐ Important</span>');
        if (item.holiday) badges.push(`<span class="note-badge note-badge-holiday">🎉 ${item.holiday.name}</span>`);
        if (item.pto) badges.push(`<span class="note-badge note-badge-pto">📅 ${item.pto.title || 'PTO'}</span>`);
        
        return `
            <div class="note-card" onclick="openNoteModal('${item.dateStr}')">
                <div class="note-card-header">
                    <div class="note-card-date">${item.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div class="note-card-badges">${badges.join('')}</div>
                </div>
                ${item.noteData.note ? `<div class="note-card-content">${item.noteData.note}</div>` : ''}
            </div>
        `;
    }).join('');
    
    document.getElementById('notesGrid').innerHTML = html;
}
    
    
        function toggleCard(setting) {
    if (!data.cardSettings) {
        data.cardSettings = {
            showNextWeekend: true,
            showNextHoliday: true,
            showNextNote: true,
            showNextPTO: true
        };
    }
    data.cardSettings[setting] = !data.cardSettings[setting];
    saveData();
    renderDashboard();
}


        // Modal functions
        function openAddPTOModal() {
            document.getElementById('ptoModal').classList.add('active');
        }

        function closePTOModal() {
    document.getElementById('ptoModal').classList.remove('active');
    document.getElementById('ptoTitle').value = '';
    document.getElementById('ptoStartDate').value = '';
    document.getElementById('ptoEndDate').value = '';
    document.getElementById('ptoHalfDay').checked = false;
    document.getElementById('ptoNote').value = '';
}

        function addPTO() {
    const title = document.getElementById('ptoTitle').value.trim();
    const startDate = document.getElementById('ptoStartDate').value;
    const endDate = document.getElementById('ptoEndDate').value;
    const halfDay = document.getElementById('ptoHalfDay').checked;
    const note = document.getElementById('ptoNote').value.trim();

    if (!startDate || !endDate) {
        alert('Please fill in start and end dates');
        return;
    }

    const newPTO = {
        id: Date.now(),
        startDate,
        endDate,
        halfDay,
        status: 'static',
        title: title || 'PTO',
        note: note
    };

    data.ptoRequests.push(newPTO);
    saveData();
    closePTOModal();
    renderDashboard();
}
        function openAddHolidayModal() {
            document.getElementById('holidayModal').classList.add('active');
        }

        function closeHolidayModal() {
            document.getElementById('holidayModal').classList.remove('active');
            document.getElementById('holidayName').value = '';
            document.getElementById('holidayDate').value = '';
        }

        function addHoliday() {
            const name = document.getElementById('holidayName').value;
            const date = document.getElementById('holidayDate').value;

            if (!name || !date) {
                alert('Please fill in all fields');
                return;
            }

            data.holidays.push({ name, date });
            data.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
            saveData();
            closeHolidayModal();
            renderSettings();
            renderDashboard();
        }

        function deleteHoliday(index) {
            if (confirm('Are you sure you want to delete this holiday?')) {
                data.holidays.splice(index, 1);
                saveData();
                renderSettings();
                renderDashboard();
            }
        }

        let currentNoteDate = null;

        function openNoteModal(dateStr) {
    currentNoteDate = dateStr;
    const date = new Date(dateStr + 'T12:00:00');
    document.getElementById('noteModalDate').textContent = 
        date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    // Check if this day is a holiday
    const [year, month, day] = dateStr.split('-').map(Number);
    const holiday = data.holidays.find(h => {
        const [hYear, hMonth, hDay] = h.date.split('-').map(Number);
        return hYear === year && hMonth === month && hDay === day;
    });
    
    if (holiday) {
        document.getElementById('holidayInfoSection').style.display = 'block';
        document.getElementById('holidayInfoContent').textContent = holiday.name;
    } else {
        document.getElementById('holidayInfoSection').style.display = 'none';
    }
    
    // Check if this day is a PTO day
    const pto = data.ptoRequests.find(p => {
        const [startYear, startMonth, startDay] = p.startDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = p.endDate.split('-').map(Number);
        
        const start = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);
        const current = new Date(year, month - 1, day);
        
        return current >= start && current <= end;
    });
    
    if (pto) {
        document.getElementById('ptoInfoSection').style.display = 'block';
        let ptoInfo = `<strong>${pto.title || 'PTO'}</strong> - ${pto.status.charAt(0).toUpperCase() + pto.status.slice(1)}`;
        if (pto.halfDay) ptoInfo += ' (Half Day)';
        if (pto.note) ptoInfo += `<br><em>${pto.note}</em>`;
        document.getElementById('ptoInfoContent').innerHTML = ptoInfo;
    } else {
        document.getElementById('ptoInfoSection').style.display = 'none';
    }
    
    // Destroy existing Quill instance if it exists
    if (quillEditor) {
        quillEditor = null;
    }
    
    // Clear and recreate the editor container
    const editorContainer = document.getElementById('noteEditor');
    editorContainer.innerHTML = '<div></div>';
    
    // Initialize Quill editor on the inner div
    quillEditor = new Quill('#noteEditor div', {
        theme: 'snow',
        placeholder: 'Add a note for this day...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'header': [1, 2, 3, false] }],
                ['link'],
                ['clean']
            ]
        }
    });
    
    // Load existing note if it exists
    if (data.notes && data.notes[dateStr]) {
        if (data.notes[dateStr].note) {
            quillEditor.root.innerHTML = data.notes[dateStr].note;
        }
        document.getElementById('noteImportant').checked = data.notes[dateStr].important || false;
        
        if (data.notes[dateStr].note) {
            document.getElementById('existingNote').innerHTML = data.notes[dateStr].note;
            document.getElementById('existingNote').style.display = 'block';
            document.getElementById('deleteNoteBtn').style.display = 'inline-block';
        } else {
            document.getElementById('existingNote').style.display = 'none';
            document.getElementById('deleteNoteBtn').style.display = 'none';
        }
    } else {
        document.getElementById('noteImportant').checked = false;
        document.getElementById('existingNote').style.display = 'none';
        document.getElementById('deleteNoteBtn').style.display = 'none';
    }
    
    document.getElementById('noteModal').classList.add('active');
}
        
        function closeNoteModal() {
    document.getElementById('noteModal').classList.remove('active');
    currentNoteDate = null;
    if (quillEditor) {
        quillEditor = null;
    }
}

       function saveNote() {
    const noteHTML = quillEditor.root.innerHTML;
    const noteText = quillEditor.getText().trim();
    const important = document.getElementById('noteImportant').checked;
    
    if (!data.notes) {
        data.notes = {};
    }
    
    if (noteText || important) {
        data.notes[currentNoteDate] = {
            note: noteHTML,
            important: important
        };
    } else {
        // If both are empty, delete the note
        delete data.notes[currentNoteDate];
    }
    
    saveData();
    closeNoteModal();
    renderCalendar();
    // Refresh notes view if we're on it
    const notesView = document.getElementById('notes');
    if (notesView.classList.contains('active')) {
        renderNotes();
    }
} 
        
function getNextNote() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!data.notes) return null;
    
    const futureDates = Object.keys(data.notes)
        .filter(dateStr => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const noteDate = new Date(year, month - 1, day);
            return noteDate >= today;
        })
        .sort();
    
    if (futureDates.length === 0) return null;
    
    return {
        date: futureDates[0],
        note: data.notes[futureDates[0]]
    };
}

function getNextPTO() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futurePTO = data.ptoRequests
        .filter(pto => {
            const [year, month, day] = pto.startDate.split('-').map(Number);
            const ptoDate = new Date(year, month - 1, day);
            return ptoDate >= today;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return futurePTO.length > 0 ? futurePTO[0] : null;
}



function deleteNote() {
    if (confirm('Are you sure you want to delete this note?')) {
        if (data.notes && data.notes[currentNoteDate]) {
            delete data.notes[currentNoteDate];
            saveData();
            closeNoteModal();
            renderCalendar();
        }
    }
}

function exportData() {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    link.download = `time-off-data-${date}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate the data structure
            if (typeof importedData.ptoTotal !== 'number' ||
                !Array.isArray(importedData.holidays) ||
                !Array.isArray(importedData.ptoRequests)) {
                throw new Error('Invalid data format');
            }
            
            if (confirm('This will replace all current data. Are you sure you want to import?')) {
                data = importedData;
                
                // Ensure notes object exists
                if (!data.notes) {
                    data.notes = {};
                }
                
                saveData();
                alert('Data imported successfully!');
                
                // Refresh all views
                renderSettings();
                renderDashboard();
                renderCalendar();
                
                // Reset file input
                event.target.value = '';
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
            event.target.value = '';
        }
    };
    
    reader.readAsText(file);
}
        // Initial render
        renderDashboard();