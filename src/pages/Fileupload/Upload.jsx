import React, { useState, useEffect } from "react";
import FileUploadModal from "../Fileupload/FileUploadModal";
import { useSelector } from "react-redux";
import { CSVLink } from "react-csv";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import UploadExpensesTable from "../Upload Expenses Table/UploadExpensesTable";

const Upload = () => {
  const [isModalOpen, setModalOpen] = useState(true);
  const [uploadedData, setUploadedData] = useState([]);

  const {
    success = false,
    data = [],
    error = null,
  } = useSelector((state) => state.fileUpload || {});

  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    if (success && data?.length) {
      setUploadedData(data);
      setModalOpen(false);
    }
  }, [success, data]);

  const csvHeaders = [
    { label: "Date", key: "date" },
    { label: "Expense Name", key: "expense.expenseName" },
    { label: "Amount", key: "expense.amount" },
    { label: "Type", key: "expense.type" },
    { label: "Payment Method", key: "expense.paymentMethod" },
    { label: "Net Amount", key: "expense.netAmount" },
    { label: "Credit Due", key: "expense.creditDue" },
    { label: "Comments", key: "expense.comments" },
  ];

  const flattenDataForCSV = uploadedData.map((item) => ({
    date: item.date,
    "expense.expenseName": item.expense.expenseName,
    "expense.amount": item.expense.amount,
    "expense.type": item.expense.type,
    "expense.paymentMethod": item.expense.paymentMethod,
    "expense.netAmount": item.expense.netAmount,
    "expense.creditDue": item.expense.creditDue,
    "expense.comments": item.expense.comments,
  }));

  return (
    <div className="container">
      <h3>Upload Files</h3>
      <FileUploadModal isOpen={isModalOpen} onClose={closeModal} />

      {uploadedData.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center my-3">
            <h5 className="mb-0">Uploaded Records</h5>
            <CSVLink
              headers={csvHeaders}
              data={flattenDataForCSV}
              filename="uploaded_expenses.csv"
              className="btn btn-success"
            >
              <FontAwesomeIcon icon={faFileCsv} className="me-2" />
              Export CSV
            </CSVLink>
          </div>

          <UploadExpensesTable
            data={uploadedData}
            loading={false}
            error={error}
          />
        </>
      )}
    </div>
  );
};

export default Upload;
