const authorText = "Version 1.01 - Created by: TCID Systems Analyst";

const disclaimerText = `Schedules are subject to change without notice, due to operational demands and unforeseen complications. <br /> Please contact the ditch rider if you have questions.`;

const copywriteText = `<hr><br>
MIT License
<br><br>
Copyright © 2023 Michael Lambson
<br><br>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
<br><br>
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
<br><br>
THE SOFTWARE IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

document.getElementById("preface");
preface.innerHTML = disclaimerText; // add preface disclaimer

// Function to convert timestamp to display format
function formatTimestamp(timestamp) {
  const date = new Date((timestamp - 25569) * 86400 * 1000); // Convert Excel timestamp to JavaScript timestamp
  const hours = date.getUTCHours();
  let period;

  if (hours >= 12 && hours < 20) {
    period = "Afternoon";
  } else if ((hours >= 20 && hours <= 23) || (hours >= 0 && hours < 4)) {
    period = "Night";
  } else {
    period = "Morning";
  }

  const day = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"][
    date.getUTCDay()
  ];
  const month = date.getUTCMonth() + 1; // Months are zero-based, so add 1
  const dayOfMonth = date.getUTCDate();

  return `${day} ${month}/${dayOfMonth} | ${period}`;
}

// Function to fetch and display CSV data
function fetchDataAndDisplay(fileName) {
  fetch(`data/${fileName}`)
    .then((response) => response.text())
    .then((csvData) => {
      Papa.parse(csvData, {
        delimiter: ",",
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const data = results.data;
          const headers = Object.keys(data[0]);

          // Sort data by the first column (timestamp)
          data.sort(
            (a, b) => parseFloat(a[headers[0]]) - parseFloat(b[headers[0]])
          );

          const filterColumn4 = document.getElementById("filterColumn4");
          const filterColumn6 = document.getElementById("filterColumn6");
          const filterColumn7 = document.getElementById("filterColumn7");
          const resetFilters = document.getElementById("resetFilter");
          const dataArea = document.getElementById("dataArea");

          // Populate filter options for Column 6 and Column 7
          const uniqueValuesColumn6 = [
            ...new Set(data.map((row) => row[headers[5]])),
          ];
          uniqueValuesColumn6.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            filterColumn6.appendChild(option);
          });

          const uniqueValuesColumn7 = [
            ...new Set(data.map((row) => row[headers[6]])),
          ];
          uniqueValuesColumn7.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            filterColumn7.appendChild(option);
          });

          // Filtering

          const applyFilters = () => {
            const filterValueColumn4 = filterColumn4.value.toLowerCase();
            const filterValueColumn6 = filterColumn6.value;
            const filterValueColumn7 = filterColumn7.value;

            // Clear existing options from Column 6 and Column 7
            filterColumn6.innerHTML = '<option value="">District</option>';
            filterColumn7.innerHTML = '<option value="">Line/Head</option>';

            const table = document.createElement("table");

            const headerRow = document.createElement("tr");
            headers.forEach((headerText) => {
              const th = document.createElement("th");
              th.textContent = headerText;
              headerRow.appendChild(th);
            });

            table.appendChild(headerRow);

            data.forEach((rowData) => {
              // Ignore rows with undefined or non-numeric values in the first column
              if (
                !rowData[headers[0]] ||
                isNaN(parseFloat(rowData[headers[0]]))
              ) {
                return;
              }
              // Ignore rows that start with '0' or have '0' in the 4th column
              if (
                rowData[headers[0]].startsWith("0") ||
                rowData[headers[3]] === "0"
              ) {
                return;
              }

              // Check if filter for Column 4 is applied
              const isFilteredByColumn4 =
                filterValueColumn4 === "" ||
                rowData[headers[3]].includes(filterValueColumn4);

              // Check if filter for Column 6 is applied
              const isFilteredByColumn6 =
                filterValueColumn6 === "" ||
                rowData[headers[5]] === filterValueColumn6;

              // Check if filter for Column 7 is applied
              const isFilteredByColumn7 =
                filterValueColumn7 === "" ||
                rowData[headers[6]] === filterValueColumn7;

              // Apply filters based on cascading logic
              if (
                (isFilteredByColumn4 || filterValueColumn4 === "") &&
                (isFilteredByColumn6 || filterValueColumn6 === "") &&
                (isFilteredByColumn7 || filterValueColumn7 === "")
              ) {
                const row = document.createElement("tr");

                headers.forEach((header, index) => {
                  const cell = document.createElement("td");
                  if (index === 0) {
                    cell.textContent = formatTimestamp(
                      parseFloat(rowData[header])
                    );
                  } else if (index === 2) {
                    cell.textContent = parseInt(rowData[header]); // Convert to integer
                  } else if (index === 4 && rowData[header] === "0") {
                    cell.textContent = "--";
                  } else {
                    cell.textContent = rowData[header];
                  }
                  row.appendChild(cell);
                });

                table.appendChild(row);

                // Update filter options for Column 6 and Column 7
                if (
                  !filterColumn6.querySelectorAll(
                    `option[value="${rowData[headers[5]]}"]`
                  ).length
                ) {
                  const option6 = document.createElement("option");
                  option6.value = rowData[headers[5]];
                  option6.textContent = rowData[headers[5]];
                  filterColumn6.appendChild(option6);
                }

                if (
                  !filterColumn7.querySelectorAll(
                    `option[value="${rowData[headers[6]]}"]`
                  ).length
                ) {
                  const option7 = document.createElement("option");
                  option7.value = rowData[headers[6]];
                  option7.textContent = rowData[headers[6]];
                  filterColumn7.appendChild(option7);
                }

                // Check if the option should be selected and set the selectedIndex property
                if (rowData[headers[5]] === filterValueColumn6) {
                  filterColumn6.selectedIndex = Array.from(
                    filterColumn6.options
                  ).findIndex((option) => option.value === filterValueColumn6);
                }

                if (rowData[headers[6]] === filterValueColumn7) {
                  filterColumn7.selectedIndex = Array.from(
                    filterColumn7.options
                  ).findIndex((option) => option.value === filterValueColumn7);
                }
              }
            });

            dataArea.innerHTML = ""; // Clear previous table content
            dataArea.appendChild(table);

            // ... (rest of the function remains the same)

            // Create and populate the footer
            const footer = document.getElementById("footer");
            footer.innerHTML = ""; // Clear previous footer content

            // Create and append the second <p> element with the "disclaimer" class
            const disclaimerParagraph = document.createElement("p");
            disclaimerParagraph.innerHTML = disclaimerText;
            disclaimerParagraph.classList.add("disclaimer"); // Add the "disclaimer" class
            footer.appendChild(disclaimerParagraph);

            // Create and append the author <p> element with the "author" class
            const authorContent = document.createElement("p");
            authorContent.textContent = authorText;
            authorContent.classList.add("author"); // Add the "author" class
            footer.appendChild(authorContent);

            // Create and append the first <p> element with the "copywrite" class
            const copywriteParagraph = document.createElement("p");
            copywriteParagraph.innerHTML = copywriteText;
            copywriteParagraph.classList.add("copywrite"); // Add the "copywrite" class
            footer.appendChild(copywriteParagraph);
          };

          filterColumn4.addEventListener("input", applyFilters);
          filterColumn6.addEventListener("change", applyFilters);
          filterColumn7.addEventListener("change", applyFilters);

          // Function to reset all filters
          function resetAllFilters() {
            filterColumn4.value = ""; // Reset Column 4 filter
            filterColumn6.value = ""; // Reset Column 6 filter
            filterColumn7.value = ""; // Reset Column 7 filter

            // Clear existing options from Column 6 and Column 7 and add the default options
            filterColumn6.innerHTML = '<option value="">District</option>';
            filterColumn7.innerHTML = '<option value="">Line/Head</option>';

            // Trigger the change event on the select elements
            filterColumn6.dispatchEvent(new Event("change"));
            filterColumn7.dispatchEvent(new Event("change"));

            applyFilters(); // Apply filters after resetting
          }

          // Attach the resetAllFilters function to the reset button
          resetFilters.addEventListener("click", resetAllFilters);

          applyFilters(); // Apply initial filters
        },
      });
    });
}

// Call the function with the desired CSV file name
fetchDataAndDisplay("wos.csv");
