// Weekly Calendar View
let currentWeekStartDate = getWeekStartDate(new Date());

function getWeekStartDate(date) {
    let day = date.getDay() || 7;
    let startDate = new Date(date);
    if (day !== 1) {
        startDate.setDate(startDate.getDate() - (day - 1));
    }
    startDate.setHours(0, 0, 0, 0);
    return startDate;
}

function generateWeekName(date) {
    let weekNumber = getWeekNumber(date);
    let yearDigits = date.getFullYear().toString().slice(-2);
    let weekNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf'];
    let weekName = weekNames[weekNumber % weekNames.length];
    return `${yearDigits}W${weekNumber}-${weekName}`;
}

function getWeekNumber(date) {
    let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    let dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

function renderCalendar() {
    let weekStart = new Date(currentWeekStartDate);
    let calendarHtml = '<table class="table table-bordered"><tr>';
	for (let i = 0; i < 7; i++) {
		let date = new Date(weekStart);
		date.setDate(weekStart.getDate() + i);
		let dateString = date.toISOString().split('T')[0];
		let tickets = getValidTickets().filter(ticket => ticket.date === dateString);
		
		// Determine the day of the week
		let dayOfWeek = date.getDay();
		
		// Initialize a class for background and text colors based on the day of the week
		let dayClass = '';
		if (dayOfWeek === 0) {
			// Sunday (red background)
			dayClass = 'bg-danger text-white';
		} else if (dayOfWeek === 6) {
			// Saturday (gray background)
			dayClass = 'bg-secondary text-white';
		} else if (tickets.length > 0) {
			// Default for days with tickets (green background)
			dayClass = 'bg-success text-white';
		}
		
		// Generate calendar HTML
		calendarHtml += `<td class="${dayClass}">
			${date.toDateString()}<br>
			${tickets.length > 0 ? 'Ticket Allocated' : 'No Ticket'}
		</td>`;
	}

    calendarHtml += '</tr></table>';
    $('#calendarContainer').html(calendarHtml);
    let weekInfo = generateWeekName(currentWeekStartDate);
    $('#calendarContainer').prepend(`<h5>Week: ${weekInfo}</h5>`);
}

$('#prevWeekBtn').on('click', function() {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
    renderCalendar();
});

$('#nextWeekBtn').on('click', function() {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
    renderCalendar();
});

// Load calendar on startup
renderCalendar();
