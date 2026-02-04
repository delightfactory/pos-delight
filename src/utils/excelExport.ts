import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    // 1. Create a WorkBook
    const workbook = XLSX.utils.book_new();

    // 2. Create a WorkSheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Append Sheet to Book
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 4. Generate Excel File
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
