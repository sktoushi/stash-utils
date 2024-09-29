// Cash Account Management
let cashRecords = [];

function loadCashRecords() {
    const savedCash = localStorage.getItem('cashRecords');
    if (savedCash) {
        cashRecords = JSON.parse(savedCash);
    }
    renderCashTable();
}

function saveCashRecords() {
    localStorage.setItem('cashRecords', JSON.stringify(cashRecords));
}

function renderCashTable() {
    let tbody = $('#cashTable tbody');
    tbody.empty();
    let recordsToShow = cashRecords.slice(-10).reverse();
    recordsToShow.forEach((record, index) => {
        let allocatedAmount = record.tickets.reduce((sum, ticket) => sum + ticket.amount, 0);
        let allocatedPercentage = ((allocatedAmount / record.amount) * 100).toFixed(2);
        let row = `<tr>
            <td>${record.date}</td>
            <td>${record.amount}</td>
            <td>
                <div class="progress">
                  <div class="progress-bar bg-info" role="progressbar" style="width: ${allocatedPercentage}%">
                    ${allocatedAmount} / ${record.amount}
                  </div>
                </div>
            </td>
            <td>
                <button class="btn btn-primary btn-sm allocateBtn" data-index="${cashRecords.length - index - 1}">Allocate</button>
                <button class="btn btn-danger btn-sm unallocateBtn" data-index="${cashRecords.length - index - 1}">Unallocate</button>
            </td>
        </tr>`;
        tbody.append(row);
    });

    // Update total allocation progress
    updateAllocationProgress();
}

function updateAllocationProgress() {
    let totalAmount = cashRecords.reduce((sum, record) => sum + record.amount, 0);
    let totalAllocated = cashRecords.reduce((sum, record) => sum + record.tickets.reduce((s, t) => s + t.amount, 0), 0);
    let allocatedPercentage = totalAmount > 0 ? ((totalAllocated / totalAmount) * 100).toFixed(2) : 0;
    $('#allocatedProgress').css('width', allocatedPercentage + '%').text(`${totalAllocated} Allocated`);
    $('#unallocatedProgress').css('width', (100 - allocatedPercentage) + '%').text(`${totalAmount - totalAllocated} Unallocated`);
}

// Add Cash
$('#cashForm').on('submit', function(e) {
    e.preventDefault();
    let amount = parseInt($('#cashAmount').val());
    if (amount > 0) {
        let record = {
            date: new Date(),
            amount: amount,
            allocated: false,
            tickets: []
        };
        cashRecords.push(record);
        saveCashRecords();
        renderCashTable();
        $('#cashModal').modal('hide');
        $('#cashForm')[0].reset();
    } else {
        alert('Amount must be greater than zero.');
    }
});

// Allocate Cash
$(document).on('click', '.allocateBtn', function() {
    let index = $(this).data('index');
    let record = cashRecords[index];
    if (record.allocated) {
        alert('This cash record is already allocated.');
        return;
    }
    // Open allocation modal
    openAllocationModal(record, index);
});

// Unallocate Cash
$(document).on('click', '.unallocateBtn', function() {
    let index = $(this).data('index');
    let record = cashRecords[index];
    if (!record.allocated) {
        alert('This cash record is not allocated.');
        return;
    }
    unallocateCash(index);
});

function openAllocationModal(record, index) {
    // Create and show modal
    let modalHtml = `
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <form id="allocationForm">
          <div class="modal-header">
            <h5 class="modal-title">Allocate Cash</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="closeAllocationModal">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          
          <div class="modal-body">
            <p>Choose allocation option for amount: <strong>${record.amount}</strong></p>
            <div class="form-group">
                <label for="allocationOption">Allocation Option</label>
                <select class="form-control" id="allocationOption" required>
                    <option value="weekdays">Allocate evenly for the next weekdays</option>
                    <option value="period">Allocate evenly for a specified time period</option>
                </select>
            </div>
            <div id="dateRangeFields" style="display: none;">
                <div class="form-group">
                    <label for="startDate">Start Date</label>
                    <input type="date" class="form-control" id="startDate">
                </div>
                <div class="form-group">
                    <label for="endDate">End Date</label>
                    <input type="date" class="form-control" id="endDate">
                </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary">Allocate</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal" id="closeAllocationModalFooter">Close</button>
          </div>
          
        </form>
      </div>
    </div>
    `;
    $('#ticketModal').html(modalHtml);
    $('#ticketModal').modal('show');

    // Handle allocation option change
    $('#allocationOption').on('change', function() {
        if ($(this).val() === 'period') {
            $('#dateRangeFields').show();
            $('#startDate').attr('required', true);
            $('#endDate').attr('required', true);
        } else {
            $('#dateRangeFields').hide();
            $('#startDate').removeAttr('required');
            $('#endDate').removeAttr('required');
        }
    });

    // Handle allocation form submission
    $('#allocationForm').on('submit', function(e) {
        e.preventDefault();
        let option = $('#allocationOption').val();
        let amount = record.amount;
        let ticketUnit = config.ticketUnit;
        let numTickets = Math.floor(amount / ticketUnit);
        if (numTickets <= 0) {
            alert('Insufficient amount to allocate tickets.');
            return;
        }
        let tickets = [];
        if (option === 'weekdays') {
            let currentDate = new Date();
            let allocatedTickets = 0;
            while (allocatedTickets < numTickets) {
                currentDate.setDate(currentDate.getDate() + 1);
                if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                    tickets.push(createTicket(currentDate, ticketUnit));
                    allocatedTickets++;
                }
            }
        } else if (option === 'period') {
            // Parse the start and end dates from input fields
            let startDate = new Date($('#startDate').val());
            let endDate = new Date($('#endDate').val());
            
            console.log('Start Date:', startDate);
            console.log('End Date:', endDate);
            
            // Check if end date is before start date
            if (endDate < startDate) {
                console.warn('End date is before start date.');
                alert('End date must be after start date.');
                return;
            }
            
            // Initialize totalDays counter
            let totalDays = 0;
            let tempDate = new Date(startDate);
            
            // Calculate total weekdays between startDate and endDate
            while (tempDate <= endDate) {
                const dayOfWeek = tempDate.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                    totalDays++;
                }
                tempDate.setDate(tempDate.getDate() + 1);
            }
            
            console.log('Total Weekdays:', totalDays);
            
            // Check if there are no weekdays in the selected period
            if (totalDays === 0) {
                console.warn('No weekdays found in the selected period.');
                alert('No weekdays in the selected period.');
                return;
            }
            
            // Define the amount per day (ensure ticketUnit is defined)
            let amountPerDay = ticketUnit;
            console.log('Amount Per Day:', amountPerDay);
            
            // Reset tempDate to startDate for ticket creation
            tempDate = new Date(startDate);
            
            // Initialize tickets array if not already defined
            if (typeof tickets === 'undefined') {
                var tickets = [];
            }
            
            while (tempDate <= endDate) {
                const dayOfWeek = tempDate.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                    const ticket = createTicket(tempDate, amountPerDay);
                    tickets.push(ticket);
                    console.log('Ticket Created:', ticket);
                }
                tempDate.setDate(tempDate.getDate() + 1);
            }
            
            console.log('All Tickets:', tickets);
        }
        // Assign tickets to record
        record.tickets = tickets;
        record.allocated = true;
        saveCashRecords();
        renderCashTable();
        $('#ticketModal').modal('hide');
    });

    // Close modal handlers
    $('#closeAllocationModal, #closeAllocationModalFooter').on('click', function() {
        $('#ticketModal').modal('hide');
    });
}

function createTicket(date, amount) {
    return {
        date: date.toISOString().split('T')[0],
        amount: amount,
        consumed: 0,
        valid: true,
        stashed: false,
        serial: generateSerial()
    };
}

function generateSerial() {
    return 'TICKET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function unallocateCash(index) {
    let record = cashRecords[index];
    record.tickets.forEach(ticket => {
        ticket.valid = false;
    });
    record.tickets = [];
    record.allocated = false;
    saveCashRecords();
    renderCashTable();
    alert('Cash unallocated and tickets invalidated.');
}

// Load cash records on startup
loadCashRecords();
