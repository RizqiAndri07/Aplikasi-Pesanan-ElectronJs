document.getElementById("file").addEventListener("change", handleFile, false);
document.getElementById("searchButton").addEventListener("click", handleSearch);
document
  .getElementById("modalCloseButton")
  .addEventListener("click", closeModal);
document
  .getElementById("modalSubmitButton")
  .addEventListener("click", submitModal);
document
  .getElementById("modalUpdateButton")
  .addEventListener("click", updateModal);
document
  .getElementById("modalDeleteButton")
  .addEventListener("click", deleteModal);
document
  .getElementById("restoreFile")
  .addEventListener("change", restoreData, false);
document.getElementById("saveButton").addEventListener("click", saveData);
document.getElementById("printButton").addEventListener("click", printData);
document
  .getElementById("searchHasilButton")
  .addEventListener("click", handleSearchHasilInput);
document.getElementById("clearFileButton").addEventListener("click", clearFile);
document
  .getElementById("clearHasilInputFileButton")
  .addEventListener("click", clearHasilInputFile);

let excelData = [];
let currentPage = 1;
const rowsPerPage = 10;
let selectedItem = null;
let hasilInputData = [];
let currentNumber = 1;
let editIndex = null;

function handleFile(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById("clearFileButton").classList.remove("hidden");
  }
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    excelData = XLSX.utils.sheet_to_json(firstSheet);
    console.log("Parsed Excel Data:", excelData); // Debugging line
    displayData(excelData, currentPage);
    setupPagination(excelData);
  };

  reader.readAsArrayBuffer(file);
}

function displayData(data, page) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  paginatedData.forEach((item, index) => {
    const row = document.createElement("tr");
    row.classList.add("cursor-pointer", "hover:bg-gray-200");
    row.innerHTML = `
          <td class="border p-2">${item["id barang"]}</td>
          <td class="border p-2">${item["nama barang"]}</td>
        `;
    row.addEventListener("click", () => openModal(item));
    tableBody.appendChild(row);
  });
  console.log("Displayed Data:", paginatedData); // Debugging line
}

function setupPagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(data.length / rowsPerPage);
  for (let i = 1; i <= pageCount; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.classList.add("px-4", "py-2", "mx-1", "bg-gray-200", "rounded");
    if (i === currentPage) {
      pageButton.classList.add("bg-blue-500", "text-white");
    }
    pageButton.addEventListener("click", () => {
      currentPage = i;
      displayData(data, currentPage);
      setupPagination(data);
    });
    pagination.appendChild(pageButton);
  }
}

function handleSearch() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const filteredData = excelData.filter(
    (item) =>
      item["id barang"].toLowerCase().includes(searchInput) ||
      item["nama barang"].toLowerCase().includes(searchInput)
  );
  console.log("Filtered Data:", filteredData); // Debugging line
  currentPage = 1;
  displayData(filteredData, currentPage);
  setupPagination(filteredData);
}

function openModal(item, index = null) {
  selectedItem = item;
  editIndex = index;
  const existingItem = hasilInputData.find(
    (data) => data["ID Barang"] === item["id barang"]
  );
  if (existingItem) {
    document.getElementById("modalDuplicate").classList.remove("hidden");
  } else {
    document.getElementById("modalItemName").innerText =
      item["Nama Barang"] || item["nama barang"];
    document.getElementById("modalInput").value = item.Jumlah || "";
    document.getElementById("modalInput").classList.remove("hidden");
    document
      .getElementById("modalSubmitButton")
      .classList.toggle("hidden", index !== null);
    document
      .getElementById("modalUpdateButton")
      .classList.toggle("hidden", index === null);
    document
      .getElementById("modalDeleteButton")
      .classList.toggle("hidden", index === null);
    document.getElementById("modal").classList.remove("hidden");
  }
}

document
  .getElementById("modalDuplicateCloseButton")
  .addEventListener("click", () => {
    document.getElementById("modalDuplicate").classList.add("hidden");
  });

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function submitModal() {
  const jumlah = document.getElementById("modalInput").value;
  if (jumlah) {
    const existingItem = hasilInputData.find(
      (item) => item["ID Barang"] === selectedItem["id barang"]
    );
    if (existingItem) {
      openModal(existingItem, hasilInputData.indexOf(existingItem), true);
    } else {
      const hasilInputBody = document.getElementById("hasilInputBody");
      const row = document.createElement("tr");
      row.classList.add("cursor-pointer", "hover:bg-gray-200");
      row.innerHTML = `
            <td class="border p-2">${currentNumber}</td>
            <td class="border p-2">${selectedItem["id barang"]}</td>
            <td class="border p-2">${selectedItem["nama barang"]}</td>
            <td class="border p-2">${jumlah}</td>
          `;
      row.addEventListener("click", () =>
        openModal(
          {
            No: currentNumber,
            "ID Barang": selectedItem["id barang"],
            "Nama Barang": selectedItem["nama barang"],
            Jumlah: jumlah,
          },
          hasilInputData.length
        )
      );
      hasilInputBody.appendChild(row);
      hasilInputData.push({
        No: currentNumber,
        "ID Barang": selectedItem["id barang"],
        "Nama Barang": selectedItem["nama barang"],
        Jumlah: jumlah,
      });
      currentNumber++;
      closeModal();
      displayHasilInputData(hasilInputData, currentPage); // Tambahkan ini untuk memperbarui tampilan data
      setupPaginationHasilInput(hasilInputData);
    }
  }
}

function updateModal() {
  const jumlah = document.getElementById("modalInput").value;
  if (jumlah && editIndex !== null && hasilInputData[editIndex]) {
    hasilInputData[editIndex].Jumlah = jumlah;
    displayHasilInputData(hasilInputData, currentPage);
    setupPaginationHasilInput(hasilInputData);
    closeModal();
  }
}

function deleteModal() {
  if (editIndex !== null) {
    hasilInputData.splice(editIndex, 1);
    hasilInputData = hasilInputData.map((item, index) => ({
      ...item,
      No: index + 1,
    }));
    currentNumber = hasilInputData.length + 1;
    displayHasilInputData(hasilInputData, currentPage);
    setupPaginationHasilInput(hasilInputData);
    closeModal();
    editIndex = null; // Reset editIndex after deletion
  }
}

function restoreData(event) {
  const file = event.target.files[0];
  if (file) {
    document
      .getElementById("clearHasilInputFileButton")
      .classList.remove("hidden");
  }
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const restoredData = XLSX.utils.sheet_to_json(firstSheet);
    console.log("Restored Excel Data:", restoredData); // Debugging line
    const hasilInputBody = document.getElementById("hasilInputBody");
    hasilInputBody.innerHTML = "";
    hasilInputData = restoredData.map((item, index) => ({
      No: item.No,
      "ID Barang": item["ID Barang"],
      "Nama Barang": item["Nama Barang"],
      Jumlah: item["Jumlah"],
    }));
    currentNumber = Math.max(...hasilInputData.map((item) => item.No)) + 1;
    displayHasilInputData(hasilInputData, currentPage);
    setupPaginationHasilInput(hasilInputData);
  };

  reader.readAsArrayBuffer(file);
}

async function saveData() {
  const options = {
    types: [
      {
        description: "Excel Files",
        accept: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
        },
      },
    ],
  };
  try {
    const handle = await window.showSaveFilePicker(options);
    const writable = await handle.createWritable();
    const worksheet = XLSX.utils.json_to_sheet(hasilInputData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    await writable.write(excelBuffer);
    await writable.close();
    console.log("File saved successfully");
  } catch (error) {
    console.error("Error saving file:", error);
  }
}

async function printData() {
  const options = {
    types: [
      {
        description: "PDF Files",
        accept: {
          "application/pdf": [".pdf"],
        },
      },
    ],
  };
  try {
    const handle = await window.showSaveFilePicker(options);
    const writable = await handle.createWritable();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = hasilInputData.map((item) => [
      item.No,
      item["ID Barang"],
      item["Nama Barang"],
      item.Jumlah,
    ]);
    doc.autoTable({
      head: [["No", "ID Barang", "Nama Barang", "Jumlah"]],
      body: data,
    });
    const pdfBuffer = doc.output("arraybuffer");
    await writable.write(pdfBuffer);
    await writable.close();
    console.log("File saved successfully");
  } catch (error) {
    console.error("Error saving file:", error);
  }
}

function handleSearchHasilInput() {
  const searchInput = document
    .getElementById("searchHasilInput")
    .value.toLowerCase();
  const filteredData = hasilInputData.filter(
    (item) =>
      item["ID Barang"].toLowerCase().includes(searchInput) ||
      item["Nama Barang"].toLowerCase().includes(searchInput)
  );
  currentPage = 1;
  displayHasilInputData(filteredData, currentPage);
  setupPaginationHasilInput(filteredData);
}

function displayHasilInputData(data, page) {
  const hasilInputBody = document.getElementById("hasilInputBody");
  hasilInputBody.innerHTML = "";

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  paginatedData.forEach((item, index) => {
    const row = document.createElement("tr");
    row.classList.add("cursor-pointer", "hover:bg-gray-200");
    row.innerHTML = `
      <td class="border p-2">${item.No}</td>
      <td class="border p-2">${item["ID Barang"]}</td>
      <td class="border p-2">${item["Nama Barang"]}</td>
      <td class="border p-2">${item.Jumlah}</td>
    `;
    row.addEventListener("click", () => openModal(item, index));
    hasilInputBody.appendChild(row);
  });
}

function setupPaginationHasilInput(data) {
  const pagination = document.getElementById("paginationHasilInput");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(data.length / rowsPerPage);
  for (let i = 1; i <= pageCount; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.classList.add("px-4", "py-2", "mx-1", "bg-gray-200", "rounded");
    if (i === currentPage) {
      pageButton.classList.add("bg-blue-500", "text-white");
    }
    pageButton.addEventListener("click", () => {
      currentPage = i;
      displayHasilInputData(data, currentPage);
      setupPaginationHasilInput(data);
    });
    pagination.appendChild(pageButton);
  }
}

function clearFile() {
  document.getElementById("file").value = "";
  excelData = [];
  document.getElementById("tableBody").innerHTML = "";
  document.getElementById("pagination").innerHTML = "";
  document.getElementById("clearFileButton").classList.add("hidden");
  console.log("File input cleared and data reset"); // Debugging line
}

function clearHasilInputFile() {
  document.getElementById("restoreFile").value = "";
  hasilInputData = [];
  document.getElementById("hasilInputBody").innerHTML = "";
  document.getElementById("paginationHasilInput").innerHTML = "";
  document.getElementById("clearHasilInputFileButton").classList.add("hidden");
  console.log("Hasil input file cleared and data reset"); // Debugging line
}
