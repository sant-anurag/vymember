document.addEventListener('DOMContentLoaded', function() {
            let events = [];
            let filteredEvents = [];
            let currentPage = 1;
            const eventsPerPage = 10;

            // Dropdown elements for modal
            const countrySelect = document.getElementById('editEventCountry');
            const stateSelect = document.getElementById('editEventState');
            const citySelect = document.getElementById('editEventCity');

            // Fetch events from backend
            function fetchEvents(filters = {}) {
                let params = new URLSearchParams(filters).toString();
                fetch(`/member/ajax/events/?${params}`)
                    .then(res => res.json())
                    .then(data => {
                        events = data.events;
                        filteredEvents = events;
                        currentPage = 1;
                        renderTable();
                        renderPagination();
                    });
            }

            fetchEvents();

            document.getElementById('filterBtn').onclick = function() {
                let filters = {
                    name: document.getElementById('filterEventName').value,
                    coordinator: document.getElementById('filterCoordinator').value,
                    date: document.getElementById('filterDate').value,
                    instructor: document.getElementById('filterInstructor').value
                };
                fetchEvents(filters);
            };

            document.getElementById('resetBtn').onclick = function() {
                document.getElementById('filterEventName').value = '';
                document.getElementById('filterCoordinator').value = '';
                document.getElementById('filterDate').value = '';
                document.getElementById('filterInstructor').value = '';
                fetchEvents();
            };

            document.getElementById('downloadBtn').onclick = function() {
                let filters = {
                    name: document.getElementById('filterEventName').value,
                    coordinator: document.getElementById('filterCoordinator').value,
                    date: document.getElementById('filterDate').value,
                    instructor: document.getElementById('filterInstructor').value
                };
                let params = new URLSearchParams(filters).toString();
                window.location.href = `/member/ajax/events/download/?${params}`;
            };

            function renderTable() {
                let tbody = document.querySelector('#eventsTable tbody');
                tbody.innerHTML = '';
                let start = (currentPage - 1) * eventsPerPage;
                let pageEvents = filteredEvents.slice(start, start + eventsPerPage);
                pageEvents.forEach(ev => {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${ev.id}</td>
                        <td>${ev.name}</td>
                        <td>${ev.date}</td>
                        <td>${ev.coordinator}</td>
                        <td>${ev.location}</td>
                        <td>${ev.state}</td>
                        <td>${ev.district}</td>
                        <td>${ev.country}</td>
                        <td>${ev.total_attendance}</td>
                        <td>${ev.description}</td>
                        <td>${ev.instructor}</td>
                        <td>
                            <button class="edit-btn" data-id="${ev.id}">Edit</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.onclick = function() {
                        let eventId = this.getAttribute('data-id');
                        openEditModal(eventId);
                    };
                });
            }

            function renderPagination() {
                let pagDiv = document.getElementById('pagination');
                pagDiv.innerHTML = '';
                let totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
                for (let i = 1; i <= totalPages; i++) {
                    let btn = document.createElement('button');
                    btn.textContent = i;
                    if (i === currentPage) btn.classList.add('active');
                    btn.onclick = function() {
                        currentPage = i;
                        renderTable();
                        renderPagination();
                    };
                    pagDiv.appendChild(btn);
                }
            }

            // Populate country dropdown
            function loadCountries(selectedId = '') {
                fetch('/member/ajax/countries/')
                    .then(res => res.json())
                    .then(data => {
                        countrySelect.innerHTML = '<option value="">Select Country</option>';
                        data.countries.forEach(c => {
                            let opt = document.createElement('option');
                            opt.value = c.id;
                            opt.text = c.name;
                            if (c.id == selectedId) opt.selected = true;
                            countrySelect.add(opt);
                        });
                        stateSelect.innerHTML = '<option value="">Select State</option>';
                        citySelect.innerHTML = '<option value="">Select District</option>';
                    });
            }

            // Populate state dropdown
            function loadStates(countryId, selectedId = '') {
                if (!countryId) {
                    stateSelect.innerHTML = '<option value="">Select State</option>';
                    citySelect.innerHTML = '<option value="">Select District</option>';
                    return;
                }
                fetch(`/member/ajax/states/?country_id=${countryId}`)
                    .then(res => res.json())
                    .then(data => {
                        stateSelect.innerHTML = '<option value="">Select State</option>';
                        data.states.forEach(s => {
                            let opt = document.createElement('option');
                            opt.value = s.id;
                            opt.text = s.name;
                            if (s.id == selectedId) opt.selected = true;
                            stateSelect.add(opt);
                        });
                        citySelect.innerHTML = '<option value="">Select District</option>';
                    });
            }

            // Populate city dropdown
            function loadCities(stateId, selectedId = '') {
                if (!stateId) {
                    citySelect.innerHTML = '<option value="">Select District</option>';
                    return;
                }
                fetch(`/member/ajax/cities/?state_id=${stateId}`)
                    .then(res => res.json())
                    .then(data => {
                        citySelect.innerHTML = '<option value="">Select District</option>';
                        data.cities.forEach(c => {
                            let opt = document.createElement('option');
                            opt.value = c.id;
                            opt.text = c.name;
                            if (c.id == selectedId) opt.selected = true;
                            citySelect.add(opt);
                        });
                    });
            }

            // Dropdown change handlers
            countrySelect.addEventListener('change', function() {
                loadStates(this.value);
            });
            stateSelect.addEventListener('change', function() {
                loadCities(this.value);
            });

            // Edit modal logic
            function openEditModal(eventId) {
                let ev = events.find(e => e.id == eventId);
                if (!ev) return;
                document.getElementById('editEventId').value = ev.id;
                document.getElementById('editEventName').value = ev.name;
                document.getElementById('editEventDate').value = ev.date;
                document.getElementById('editEventCoordinator').value = ev.coordinator;
                document.getElementById('editEventLocation').value = ev.location;
                document.getElementById('editInstructorId').value = ev.instructor_id || '';
                document.getElementById('editEventDescription').value = ev.description || '';

                // Load country/state/city dropdowns and set selected values
                loadCountries(ev.country);
                // Wait for countries to load, then load states
                setTimeout(() => {
                    loadStates(ev.country, ev.state);
                    setTimeout(() => {
                        loadCities(ev.state, ev.district);
                    }, 300);
                }, 300);

                document.getElementById('editEventModal').style.display = 'flex';
            }

            document.getElementById('closeEditModal').onclick = function() {
                document.getElementById('editEventModal').style.display = 'none';
            };

            document.getElementById('editEventForm').onsubmit = function(e) {
                e.preventDefault();
                let eventId = document.getElementById('editEventId').value;
                let payload = {
                    id: eventId,
                    name: document.getElementById('editEventName').value,
                    date: document.getElementById('editEventDate').value,
                    coordinator: document.getElementById('editEventCoordinator').value,
                    location: document.getElementById('editEventLocation').value,
                    instructor_id: document.getElementById('editInstructorId').value,
                    country: countrySelect.value,
                    state: stateSelect.value,
                    district: citySelect.value,
                    description: document.getElementById('editEventDescription').value
                };
                fetch('/member/ajax/events/edit/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(payload)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('editEventModal').style.display = 'none';
                        fetchEvents();
                    } else {
                        alert('Failed to update event.');
                    }
                });
            };

            function getCookie(name) {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    let cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        let cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
        });