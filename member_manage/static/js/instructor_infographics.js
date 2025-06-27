// member_manage/static/js/instructor_infographics.js

document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    document.getElementById('applyFilter').addEventListener('click', applyFilters);
    document.getElementById('resetFilter').addEventListener('click', resetFilters);
    document.getElementById('downloadReport').addEventListener('click', downloadReport);
    document.getElementById('instructorFilter').addEventListener('change', function() {
        const instructorId = this.value;
        if (instructorId !== 'all') {
            fetchInstructorDetails(instructorId);
        } else {
            hideInstructorDetailPanel();
        }
    });
});

let membersByInstructorChart, memberGrowthChart, geoDistributionChart, instructorComparisonChart, instructorTrendChart;

function initializeCharts() {
    membersByInstructorChart = new Chart(document.getElementById('membersByInstructorChart').getContext('2d'), {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Members', data: [], backgroundColor: '#4f8cff' }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
    memberGrowthChart = new Chart(document.getElementById('memberGrowthChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Growth', data: [], borderColor: '#6ed6ff', fill: false }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
    geoDistributionChart = new Chart(document.getElementById('geoDistributionChart').getContext('2d'), {
        type: 'pie',
        data: { labels: [], datasets: [{ label: 'District', data: [], backgroundColor: ['#4f8cff', '#6ed6ff', '#ff9f40', '#4bc0c0', '#ff6384', '#9966ff', '#ffcd56', '#c9cbcf'] }] },
        options: { responsive: true }
    });
    instructorComparisonChart = new Chart(document.getElementById('instructorComparisonChart').getContext('2d'), {
        type: 'radar',
        data: { labels: ['Members', 'Growth', 'Retention', 'Activity', 'Experience'], datasets: [] },
        options: { responsive: true }
    });
    instructorTrendChart = new Chart(document.getElementById('instructorTrendChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Trend', data: [], borderColor: '#4f8cff', fill: false }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
    fetchChartData();
}

function fetchChartData(params = '') {
    fetch(`/member/api/instructor-infographics-data${params ? '?' + params : ''}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            updateChartsWithData(data);
            updateStatCards(data.summary);
        })
        .catch(error => {
            console.error('Error fetching chart data:', error);
            alert('Failed to load infographics data.');
        });
}

function updateChartsWithData(data) {
    // Members by Instructor
    membersByInstructorChart.data.labels = data.membersByInstructor.labels;
    membersByInstructorChart.data.datasets[0].data = data.membersByInstructor.data;
    membersByInstructorChart.update();

    // Member Growth
    memberGrowthChart.data.labels = data.memberGrowth.labels;
    memberGrowthChart.data.datasets[0].data = data.memberGrowth.data;
    memberGrowthChart.update();

    // Geo Distribution
    geoDistributionChart.data.labels = data.geoDistribution.labels;
    geoDistributionChart.data.datasets[0].data = data.geoDistribution.data;
    geoDistributionChart.update();

    // Instructor Comparison
    instructorComparisonChart.data.datasets = data.instructorComparison.datasets;
    instructorComparisonChart.update();
}

function updateStatCards(summary) {
    document.getElementById('totalMembers').textContent = summary.totalMembers;
    document.getElementById('totalInstructors').textContent = summary.activeInstructors;
    document.getElementById('avgMembersPerInstructor').textContent = summary.avgMembersPerInstructor;
    document.getElementById('growthRate').textContent = summary.growthRate + '%';
}

function applyFilters() {
    const instructorId = document.getElementById('instructorFilter').value;
    const timeRange = document.getElementById('timeRangeFilter').value;
    const year = document.getElementById('yearFilter').value;
    const params = new URLSearchParams();
    if (instructorId !== 'all') params.append('instructor_id', instructorId);
    if (timeRange !== 'all') params.append('time_range', timeRange);
    if (year !== 'all') params.append('year', year);
    fetchChartData(params.toString());
    if (instructorId !== 'all') {
        fetchInstructorDetails(instructorId);
    } else {
        hideInstructorDetailPanel();
    }
}

function resetFilters() {
    document.getElementById('instructorFilter').value = 'all';
    document.getElementById('timeRangeFilter').value = 'all';
    document.getElementById('yearFilter').value = 'all';
    fetchChartData();
    hideInstructorDetailPanel();
}

function fetchInstructorDetails(instructorId) {
console.log('Fetching details for instructor ID:', instructorId);
    fetch(`/member/api/instructor-details/${instructorId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            showInstructorDetailPanel(data);
        })
        .catch(error => {
            console.error('Error fetching instructor details:', error);
            alert('Failed to load instructor details.');
        });
}

function showInstructorDetailPanel(data) {
    const panel = document.getElementById('instructorDetailPanel');
    panel.style.display = 'block';
    document.getElementById('instructorName').textContent = data.name;
    document.getElementById('instructorSince').querySelector('span').textContent = data.associated_since;
    document.getElementById('totalMembersMetric').textContent = data.total_members;
    document.getElementById('growthRateMetric').textContent = data.growth_rate + '%';
    document.getElementById('retentionRateMetric').textContent = data.retention_rate + '%';
    // Update trend chart
    instructorTrendChart.data.labels = data.trend.labels;
    instructorTrendChart.data.datasets[0].data = data.trend.data;
    instructorTrendChart.update();
}

function hideInstructorDetailPanel() {
    const panel = document.getElementById('instructorDetailPanel');
    panel.style.display = 'none';
}

function downloadReport() {
    const instructorId = document.getElementById('instructorFilter').value;
    const timeRange = document.getElementById('timeRangeFilter').value;
    const year = document.getElementById('yearFilter').value;
    const params = new URLSearchParams();
    if (instructorId !== 'all') params.append('instructor_id', instructorId);
    if (timeRange !== 'all') params.append('time_range', timeRange);
    if (year !== 'all') params.append('year', year);
    const url = `/member/api/download-instructor-report${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = url;
}