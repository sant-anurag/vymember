// member_manage/static/js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }

    fetch('/member/dashboard/api/metrics/')
        .then(res => res.json())
        .then(data => {
            // Growth Chart
            const growthCtx = document.getElementById('growthChart');
            if (growthCtx) {
                new Chart(growthCtx, {
                    type: 'line',
                    data: {
                        labels: data.growth.labels,
                        datasets: [{
                            label: 'New Members',
                            data: data.growth.data,
                            borderColor: '#4f8cff',
                            backgroundColor: 'rgba(79,140,255,0.1)',
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } }
                    }
                });
            }

            // Members by Instructor
            const instructorCtx = document.getElementById('instructorChart');
            if (instructorCtx) {
                new Chart(instructorCtx, {
                    type: 'bar',
                    data: {
                        labels: data.instructor.labels,
                        datasets: [{
                            label: 'Members',
                            data: data.instructor.data,
                            backgroundColor: '#6ed6ff'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } }
                    }
                });
            }
            // Top Performing Instructors
            const topInstructorCtx = document.getElementById('topInstructorChart');
            if (topInstructorCtx) {
                new Chart(topInstructorCtx, {
                    type: 'bar',
                    data: {
                        labels: data.top_instructors.labels,
                        datasets: [{
                            label: 'Members',
                            data: data.top_instructors.data,
                            backgroundColor: '#4f8cff'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } }
                    }
                });
            }
            // Geographic Distribution
            const geoCtx = document.getElementById('geoChart');
            if (geoCtx) {
                new Chart(geoCtx, {
                    type: 'pie',
                    data: {
                        labels: data.geo.labels,
                        datasets: [{
                            data: data.geo.data,
                            backgroundColor: [
                                '#4f8cff', '#6ed6ff', '#ff9f40', '#ff6384', '#36a2eb', '#9966ff', '#ffcd56'
                            ]
                        }]
                    },
                    options: { responsive: true }
                });
            }


        })
        .catch(err => {
            console.error('Error loading dashboard metrics:', err);
        });
});