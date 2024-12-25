const fetchPrinters = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/d1/printers');
        if (!response.ok) {
            throw new Error("Failed to fetch printers");
        }
        const data = await response.json();
        renderPrinters(data.data);
    } catch (error) {
        console.error(error);
        alert("Không thể tải danh sách máy in!");
    }
};


const handleToggleStatus = async (printerId, currentStatus) => {
    const response = window.confirm("Bạn có chắc muốn thay đổi trạng thái của máy in?");
    if (!response) return;

    try {
        // const newStatus = currentStatus === 'enable' ? 'disable' : 'enable';

        const updateResponse = await fetch(`http://localhost:3000/api/d1/printers/${printerId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: currentStatus
            }),
        });

        if (!updateResponse.ok) {
            throw new Error("Không thể cập nhật trạng thái máy in");
        }

        fetchPrinters(); // Tải lại danh sách máy in
    } catch (e) {
        console.log(e.message);
        alert("Không thể thay đổi trạng thái của máy in ngay bây giờ! Vui lòng thử lại sau!");
    }
};

const renderPrinters = (printers) => {
    const printersRowsContainer = document.querySelector(".printers-rows");

    printersRowsContainer.innerHTML = ''; 

    printers.forEach(printer => {
        const row = document.createElement("div");
        row.classList.add("printers-row");

        const statusClass = printer.status === 'enable' ? 'status-active' : 'status-disabled';
        const statusText = printer.status === 'enable' ? 'Hoạt động' : 'Vô hiệu hóa';

        row.innerHTML = `
            <div class="printer-checkbox-container">
                <input class="printer-checkbox" type="checkbox">
            </div>

            <div class="printer-display">
                <div class="printer-model">${printer.branchName}</div>
                <div class="printer-model">${printer.model}</div>
                <div class="printer-id">${printer.Printer_ID}</div>
                <div class="printer-location">${printer.location.building}</div>
                <div class="printer-weight">${printer.weight || 'N/A'}</div>
                <div class="printer-status ${statusClass}">${statusText}</div>
                <div class="printer-actions">
                    <img class="printer-infor" src="images/icons/infor.png" alt="" onclick="showPrinterInfo(${printer.Printer_ID})">
                    <img class="printer-delete" src="images/icons/delete.png" alt="" onclick="handleDelete(${printer.Printer_ID})">
                </div>
            </div>

            <div class="toggle-button-container">
                <input type="checkbox" id="toggle-${printer.Printer_ID}" class="toggle-checkbox" ${printer.status === 'disable' ? 'checked' : ''} onclick="handleToggleStatus(${printer.Printer_ID}, '${printer.status}')">
                <label for="toggle-${printer.Printer_ID}" class="toggle-label">
                    <span class="toggle-circle"></span>
                </label>
            </div>
        `;

        printersRowsContainer.appendChild(row);
    });
};

const showPrinterInfo = async (printer_ID) => {
    const res = window.confirm("Bạn có chắc muốn xem thông tin máy in này?");
    if (!res) return;

    // Điều hướng đến trang thông tin máy in với ID máy in
    window.location.href = `admin-info-printer.html?printer_ID=${printer_ID}`;
};

const handleDelete = async (printer_ID) => {
    const res = window.confirm("Bạn có chắc muốn xóa máy in này? Khi xóa đi rồi sẽ không thể hồi phục lại được!");
    if (!res) return;

    try {
        const deleteResponse = await fetch(`http://localhost:3000/api/d1/printers/${printer_ID}`, { method: 'DELETE' });

        if (!deleteResponse.ok) {
            throw new Error("Failed to delete printer");
        }

        fetchPrinters(); // Re-fetch and update the printer list
    } catch (e) {
        alert("Không thể xóa máy in ngay lúc này! Vui lòng thử lại sau!");
    }
};

// Call fetchPrinters when the page loads
window.onload = fetchPrinters;
