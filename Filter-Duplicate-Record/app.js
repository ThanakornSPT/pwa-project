// อ้างอิงถึงองค์ประกอบในหน้า HTML
const fileInput = document.getElementById('excelFile');
const processBtn = document.getElementById('processBtn');
const statusDiv = document.getElementById('status');
const downloadLink = document.getElementById('downloadLink');

// ตัวแปรสำหรับเก็บข้อมูลที่อ่านได้จากไฟล์
let workbook = null;
let originalFileName = '';

// เปิดใช้งานปุ่ม "ประมวลผล" เมื่อมีการเลือกไฟล์
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        statusDiv.textContent = `ไฟล์ที่เลือก: ${file.name}`;
        originalFileName = file.name;
        processBtn.disabled = false;
        downloadLink.style.display = 'none';
    } else {
        processBtn.disabled = true;
    }
});

// จัดการเหตุการณ์เมื่อคลิกปุ่ม "ประมวลผล"
processBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        statusDiv.textContent = 'กำลังประมวลผล... กรุณารอสักครู่';
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            workbook = XLSX.read(data, { type: 'array' });
            
            // เรียกฟังก์ชันสำหรับประมวลผลข้อมูล
            processAndRemoveRecords();
        };
        reader.readAsArrayBuffer(file);
    }
});

// ฟังก์ชันหลักสำหรับประมวลผลและลบข้อมูล
function processAndRemoveRecords() {
    if (!workbook) {
        statusDiv.textContent = 'ไม่พบไฟล์ที่จะประมวลผล';
        return;
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // แปลงข้อมูลจาก Sheet เป็นรูปแบบ JSON เพื่อให้ง่ายต่อการจัดการ
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
        statusDiv.textContent = 'ไฟล์ไม่มีข้อมูลที่เพียงพอ';
        return;
    }

    // เก็บแถวที่เป็น header แยกไว้
    const header = jsonData[0];
    // ข้อมูลจริง (ไม่รวม header)
    let records = jsonData.slice(1); 

    // หา index ของคอลัมน์ ID (B) และ Date time (K)
    const idColIndex = 2; // Column B
    const dateColIndex = 12; // Column K
    
    if (records.length === 0) {
        statusDiv.textContent = 'ไม่พบข้อมูลในไฟล์';
        return;
    }
    
    // จัดเรียงข้อมูลตาม ID และเวลา (สำคัญมาก!)
    records.sort((a, b) => {
        const idA = a[idColIndex];
        const idB = b[idColIndex];
        
        if (idA !== idB) {
            return idA - idB;
        }

        const dateA = new Date(a[dateColIndex]);
        const dateB = new Date(b[dateColIndex]);
        return dateA - dateB;
    });

    const filteredRecords = [];
    if (records.length > 0) {
        // เพิ่ม record แรกเข้าไปก่อน เพราะไม่มี record ก่อนหน้าให้เปรียบเทียบ
        filteredRecords.push(records[0]);
    }

    // วนลูปเพื่อตรวจสอบและกรองข้อมูล
    for (let i = 1; i < records.length; i++) {
        const currentRecord = records[i];
        const previousRecord = records[i - 1];

        const currentId = currentRecord[idColIndex];
        const previousId = previousRecord[idColIndex];

        // ตรวจสอบ ID
        if (currentId === previousId) {
            const currentDate = new Date(currentRecord[dateColIndex]);
            const previousDate = new Date(previousRecord[dateColIndex]);

            // คำนวณส่วนต่างของเวลาเป็นนาที
            const timeDiffMinutes = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60);

            // ตรวจสอบเงื่อนไข: หากเวลาห่างกันไม่เกิน 10 นาที
            if (timeDiffMinutes > 10) {
                filteredRecords.push(currentRecord);
            }
        } else {
            // หาก ID ไม่เหมือนกัน ให้เก็บ record ปัจจุบันไว้เสมอ
            filteredRecords.push(currentRecord);
        }
    }
    
    // สร้าง Workbook ใหม่จากข้อมูลที่ผ่านการกรองแล้ว
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet([header, ...filteredRecords], { skipHeader: true });
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, firstSheetName);
    
    // สร้างไฟล์และให้ผู้ใช้ดาวน์โหลด
    const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
    const newFileName = `processed_${originalFileName}`;
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = newFileName;
    downloadLink.textContent = `ดาวน์โหลดไฟล์: ${newFileName}`;
    downloadLink.style.display = 'block';

    statusDiv.textContent = `การประมวลผลเสร็จสิ้น! ลบข้อมูลไป ${records.length - filteredRecords.length} แถว`;
}