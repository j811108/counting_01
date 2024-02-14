const dateInput = document.getElementById("date");
const categorySelect = document.getElementById("category");
const amountNZInput = document.getElementById("amount-NZ");
const salaryInput = document.getElementById("salary");
const descriptionInput = document.getElementById("description");
const paymentMethodSelect = document.getElementById("payment-method");
const paymentBySelect = document.getElementById("payment-by");
const amountTWInput = document.getElementById("amount-TW");
const transTWInput = document.getElementById("trans-TW");
const addEntryButton = document.getElementById("add-entry");
const entryList = document.getElementById("entry-list");
const totalAmount = document.getElementById("total-amount");

const copyEntriesButton = document.getElementById("copy-entries");

// 获取所有的表格行
const entryRows = document.querySelectorAll("#entry-list tr");

entryList.addEventListener("click", (event) => {
    const target = event.target;
    if (target.classList.contains("delete-entry-button")) {
        // 刪除
        console.log("delete");
        const row = target.closest("tr");
        row.remove();
    }
    if (target.classList.contains("edit-entry-button")) {
        // 編輯
        console.log("edit");
        const row = target.closest("tr");
        row.contentEditable = "true";
        // blur 驗證內容與編輯完成後的處理
        row.addEventListener("blur", () => {
            row.contentEditable = "false";
        });
    }
    countTotal();
});


// payment-method的change
paymentMethodSelect.addEventListener("change", () => {
    // 获取当前选择的payment-method
    const selectedPaymentMethod = paymentMethodSelect.value;
    
    // 设置paymentBy字段的逻辑
    if (selectedPaymentMethod === "國泰-8" || selectedPaymentMethod === "玉山" || selectedPaymentMethod === "ANZ-8") {
        paymentBySelect.value = "J8";
    } else {
        paymentBySelect.value = "EG";
    }
});

// 用fixer.io取得貨幣轉換
const apiKey = '2a48f29c4a52187efead891056e87354'; 
const baseUrl = 'http://data.fixer.io/api/latest';

// 设置您的转换选项
const baseCurrency = 'NZD'; // 源货币
const targetCurrency = 'TWD'; // 目标货币

// 发起 API 请求
fetch(`${baseUrl}?access_key=${apiKey}`)
// fetch(`${baseUrl}?access_key=${apiKey}&base=${baseCurrency}&symbols=${targetCurrency}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    const exchangeRate = data.rates[targetCurrency];
    const baseRate = data.rates[baseCurrency];
    console.log("NZD:" + baseRate);
    console.log("TWD:" + exchangeRate);
    // 在这里使用 exchangeRate 来执行货币转换
  })
  .catch(error => {
    console.error('API 请求失败', error);
  });


//增加
addEntryButton.addEventListener("click", () => {
    //抓值
    const date = getCurrentDate(dateInput.value);
    const category = categorySelect.value;
    const amountNZ = parseFloat(amountNZInput.value) || 0;
    const salary = parseFloat(salaryInput.value) || 0;
    const description = descriptionInput.value;
    const paymentMethod = paymentMethodSelect.value;
    const paymentBy = paymentBySelect.value;
    const amountTW = parseFloat(amountTWInput.value) || 0;
    const transTW = parseFloat(transTWInput.value) || 0;

    //必填
    if (category === "" || (isNaN(amountTW) && isNaN(amountNZ))) {
        alert("分類和紐支出或台幣支出字段為必填。");
        return;
    }

    //明細容器
    const entry = {
        date,
        category,
        amountNZ,
        salary,
        description,
        paymentMethod,
        paymentBy,
        amountTW,
        transTW,
    };

    //建立明細
    const entryRow = entryList.insertRow();

    const dateCell = entryRow.insertCell(0);
    const categoryCell = entryRow.insertCell(1);
    const amountNZCell = entryRow.insertCell(2);
    const salaryCell = entryRow.insertCell(3);
    const descriptionCell = entryRow.insertCell(4);
    const paymentMethodCell = entryRow.insertCell(5);
    const paymentByCell = entryRow.insertCell(6);
    const amountTWCell = entryRow.insertCell(7);
    const transTWCell = entryRow.insertCell(8);

    dateCell.textContent = entry.date;
    categoryCell.textContent = entry.category;
    amountNZCell.textContent = `${entry.amountNZ.toFixed(2)}`;
    salaryCell.textContent = `${entry.salary.toFixed(2)}`;
    descriptionCell.textContent = entry.description;
    paymentMethodCell.textContent = entry.paymentMethod;
    paymentByCell.textContent = entry.paymentBy;
    // 根据paymentBy的值设置entryRow的背景颜色
    if (paymentBySelect.value === "J8") {
        paymentByCell.style.backgroundColor = "lightblue";
    } else if (paymentBySelect.value === "EG") {
        paymentByCell.style.backgroundColor = "orange";
    } else {
        paymentByCell.style.backgroundColor = ""; // 恢复默认背景颜色
    }

    amountTWCell.textContent = `${entry.amountTW.toFixed(2)}`;
    transTWCell.textContent = `${entry.transTW.toFixed(2)}`;
    
    // 每行最後增加控制按鈕
    const editButtonCell = entryRow.insertCell();
    const editButton = document.createElement("button");
    editButton.textContent = "编辑";
    editButton.classList.add("edit-entry-button");
    editButtonCell.appendChild(editButton);

    const deleteButtonCell = entryRow.insertCell();
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "删除";
    deleteButton.classList.add("delete-entry-button");
    deleteButtonCell.appendChild(deleteButton);

    console.log("entryRow=" + entryRow);
    saveRecord(entryRow);
    countTotal();

    // 照日期排序
    entrySort();

    // 清空
    clearInputFields();
});

function countTotal() {
    // 更新總金额
    const rows = Array.from(entryList.rows);
    let total = 0;
    let salary = 0;
    let amountNZ = 0;
    let transTW = 0;
    rows.forEach((row) => {
        amountNZ += parseFloat(row.cells[2].textContent);
        salary += parseFloat(row.cells[3].textContent);
        transTW += parseFloat(row.cells[8].textContent);
    });
    total += salary - amountNZ - transTW;
    totalAmount.textContent = `${total.toFixed(2)}`;
    console.log("total=" + total);
}

function entrySort() {
    const rows = Array.from(entryList.rows);
    // 日期小的在前面
    rows.sort((a, b) => {
        const dateA = new Date(a.cells[0].textContent);
        const dateB = new Date(b.cells[0].textContent);
        console.log(dateA + "" + dateB);
        return dateA - dateB;
    });
    
    rows.forEach(row => entryList.appendChild(row));
}


copyEntriesButton.addEventListener("click", () => {
    const entryListRows = document.querySelectorAll("#entry-list tr");
    let copiedText = '';

    // 一行行複製
    entryListRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, index) => {
            const hasButton = cell.querySelector("button");
            if (!hasButton) {
                copiedText += cell.textContent;
                if (index < cells.length - 1) {
                    copiedText += "\t"; // 表格換格符號
                }
            }
        });
        copiedText += "\n"; // 换行符號
    });

    const textArea = document.createElement("textarea");
    textArea.value = copiedText;
    document.body.appendChild(textArea);
    textArea.select();

    // 複製
    try {
        document.execCommand("copy");
        // 網頁封鎖複製權限的話，改用Clipboard.js
        // new ClipboardJS(copyButton);
        // copyButton.click();
        // document.body.removeChild(copyButton);
        alert("複製完成：\n\n" + copiedText);
    } catch (err) {
        // 复制失败时提醒用户手动复制
        alert("複製失敗，請手動複製：\n\n" + copiedText);
    }

    // 移除複製內容
    document.body.removeChild(textArea);
});

//歷史紀錄
const showRecordsButton = document.getElementById("show-records");
const eraseRecordsButton = document.getElementById("erase-records");
const recordsTable = document.getElementById("records-table");

recordsTable.style.display = "none";
// 处理“显示记录”按钮的点击事件
showRecordsButton.addEventListener("click", () => {
  // 检查记录表格是否可见
  if (recordsTable.style.display === "none" || recordsTable.style.display === "") {
    // 显示记录表格
    recordsTable.style.display = "table";
    // 显示保存的记录
    displayRecords();
  } else {
    // 隐藏记录表格
    recordsTable.style.display = "none";
  }
});

eraseRecordsButton.addEventListener("click", () => {
    localStorage.removeItem("records");
    const tbody = recordsTable.querySelector("tbody");
    tbody.innerHTML = "";
})

// 显示保存的记录
function displayRecords() {
    // 从本地存储中检索记录数据
    const storedRecords = JSON.parse(localStorage.getItem("records")) || [];

    // 清空表格中的旧记录
    const tbody = recordsTable.querySelector("tbody");
    tbody.innerHTML = "";

    // 遍历记录并将它们添加到表格中
    storedRecords.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${record.date}</td><td>${record.category}</td><td>${record.amount}</td>`;
    tbody.appendChild(row);
    // 添加其他记录字段
    });
}

// 在记账时保存记录
function saveRecord(record) {
    // 从本地存储中检索记录数据
    const storedRecords = JSON.parse(localStorage.getItem("records")) || [];

    // 添加新记录
    storedRecords.push(record);

    // 将记录数据保存回本地存储
    localStorage.setItem("records", JSON.stringify(storedRecords));
}

// 日期格式
function getCurrentDate() {
    const selectedDate = dateInput.value === "" ? new Date() : new Date(dateInput.value);
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");
    return `${year}/${month}/${day}`;
}

// 清空
function clearInputFields() {
    // dateInput.value = "";
    amountNZInput.value = "";
    salaryInput.value = "";
    descriptionInput.value = "";
    amountTWInput.value = "";
    transTWInput.value = "";
    categorySelect.selectedIndex = 0;
    paymentMethodSelect.selectedIndex = 0;
    paymentBySelect.selectedIndex = 0;
}
