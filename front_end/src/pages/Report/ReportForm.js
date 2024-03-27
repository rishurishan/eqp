import React, { useState } from "react";
import "./ReportForm.css";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    clinicName: "",
    physicianName: "",
    physicianContact: "",
    patientFirstName: "",
    patientLastName: "",
    patientDob: "",
    patientContact: "",
    chiefComplaint: "",
    consultationNote: "",
    clinicLogo: null, // Added for the logo image file
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    setFormData((prevState) => ({
      ...prevState,
      [name]: file,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.clinicName.trim()) {
      errors.clinicName = "Clinic name is required";
    }
    if (!formData.physicianName.trim()) {
      errors.physicianName = "Physician name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.physicianName)) {
      errors.physicianName = "Physician name should only contain letters and spaces";
    }
    if (!formData.patientFirstName.trim()) {
      errors.patientFirstName = "Patient first name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.patientFirstName)) {
      errors.patientFirstName = "Patient first name should only contain letters and spaces";
    }
    if (!formData.patientLastName.trim()) {
      errors.patientLastName = "Patient last name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.patientLastName)) {
      errors.patientLastName = "Patient last name should only contain letters and spaces";
    }
    if (!formData.physicianContact.trim()) {
      errors.physicianContact = "Physician contact is required";
    } else if (!/^\d{10}$/.test(formData.physicianContact)) {
      errors.physicianContact = "Invalid phone number format (should be 10 digits)";
    }
    if (!formData.patientContact.trim()) {
      errors.patientContact = "Patient contact is required";
    } else if (!/^\d{10}$/.test(formData.patientContact)) {
      errors.patientContact = "Invalid phone number format (should be 10 digits)";
    }
    
    if (!formData.patientDob) {
      errors.patientDob = "Patient date of birth is required";
    }
    if (!formData.chiefComplaint.trim()) {
      errors.chiefComplaint = "Chief complaint is required";
    }
    if (!formData.consultationNote.trim()) {
      errors.consultationNote = "Consultation note is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // **************pdf generation*********************************

  const generatePDF = () => {
    const doc = new jsPDF();
  
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
  
    const timestamp = formatDate(new Date());
    const filename = `CR_${formData.patientLastName}_${formData.patientFirstName}_${formData.patientDob}.pdf`;
  
    // Page number footer callback
    const footer = (data) => {
      let str = 'Page ' + doc.internal.getNumberOfPages();
      // Add a footer with the timestamp and IP (static example here)
      doc.setFontSize(10);
      doc.text(`This report is generated on ${timestamp}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      doc.text(str, doc.internal.pageSize.width - data.settings.margin.right - 10, doc.internal.pageSize.height - 10);
    };
  
    // Before this, you should check if clinicLogo is not null and handle it as in your original code
    if (formData.clinicLogo) {
      const reader = new FileReader();
  
      reader.onload = function(event) {
        const imgData = event.target.result;
        doc.addImage(imgData, 'JPEG', 15, 40, 50, 50); // Adjust position (x, y) and size (width, height) as needed
  
        // Add other content after the image has been added
        addContentToPDF(doc);
        doc.save(filename);
      };
  
      reader.onerror = function(error) {
        console.log('Error: ', error);
      };
  
      reader.readAsDataURL(formData.clinicLogo);
    } else {
      // If no logo, just add content and save
      addContentToPDF(doc);
      doc.save(filename);
    }
  
    // Header
    doc.setFontSize(18);
    doc.text('Medical Report', 14, 22);
    
    // Optionally add more formatting here
  
    // You would then call autoTable as follows
    autoTable(doc, {
      html: '#your-table-id', // Your table ID if you have the data in an HTML table
      didDrawPage: (data) => {
        if (formData.clinicLogo) {
          // You might have to adjust these coordinates according to the dimensions of your logo
          doc.addImage(formData.clinicLogo, 'PNG', data.settings.margin.left, 15, 30, 15);
        }
      },
      margin: { top: 30 },
      startY: doc.internal.pageSize.height / 2, // You might want to calculate this based on your page content
      theme: 'plain', // Choose a theme or customize it as needed
      footStyles: { fillColor: [255, 255, 255] }, // Optional styling for the footer
      willDrawCell: data => {
        // This can be used to format cells as needed, e.g., for text formatting
      },
      didDrawPage: footer, // Adding the footer to each page
    });
  
    // Saving the document with the dynamic name
    doc.save(filename);
  };
  
  function addContentToPDF(doc) {
    const tableColumn = ["Field", "Value"];
    const tableRows = [];
  
    Object.keys(formData).forEach(key => {
      if (key !== "clinicLogo") { // Avoid adding the logo file reference as a text
        tableRows.push([key, formData[key] instanceof File ? "File Uploaded" : formData[key]]);
      }
    });
  
    // Optionally adjust startY based on your image size if logo is present
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 100, // Adjust this value as needed to place the table below your image
    });
  }
  
 // **************pdf generation*********************************

 const handleSubmit = (e) => {
  e.preventDefault();

  if (validateForm()) {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    // Here you would typically send the data to a server or process it
    generatePDF();
    console.log("Form data ready to be sent to the server:", data);
  }
};

return (
  <form onSubmit={handleSubmit} className="report-form">
    <div className="form-group">
      <label>Clinic Name</label>
      <input
        type="text"
        name="clinicName"
        value={formData.clinicName}
        onChange={handleChange}
      />
      {formErrors.clinicName && <span className="error">{formErrors.clinicName}</span>}
    </div>
    <div className="form-group">
      <label>Physician Name</label>
      <input
        type="text"
        name="physicianName"
        value={formData.physicianName}
        onChange={handleChange}
      />
      {formErrors.physicianName && <span className="error">{formErrors.physicianName}</span>}
    </div>
    <div className="form-group">
      <label>Physician Contact</label>
      <input
        type="text"
        name="physicianContact"
        value={formData.physicianContact}
        onChange={handleChange}
      />
    </div>
    <div className="form-row">
      <div className="form-group">
        <label>Patient First Name</label>
        <input
          type="text"
          name="patientFirstName"
          value={formData.patientFirstName}
          onChange={handleChange}
        />
        {formErrors.patientFirstName && <span className="error">{formErrors.patientFirstName}</span>}
      </div>
      <div className="form-group">
        <label>Patient Last Name</label>
        <input
          type="text"
          name="patientLastName"
          value={formData.patientLastName}
          onChange={handleChange}
        />
        {formErrors.patientLastName && <span className="error">{formErrors.patientLastName}</span>}
      </div>
    </div>
    <div className="form-row">
      <div className="form-group">
        <label>Patient DOB</label>
        <input
          type="date"
          name="patientDob"
          value={formData.patientDob}
          onChange={handleChange}
          placeholder="dd/mm/yyyy"
        />
        {formErrors.patientDob && <span className="error">{formErrors.patientDob}</span>}
      </div>
      <div className="form-group">
        <label>Patient Contact</label>
        <input
          type="text"
          name="patientContact"
          value={formData.patientContact}
          onChange={handleChange}
        />
      </div>
    </div>
    <div className="form-group">
      <label>Chief Complaint</label>
      <textarea
        name="chiefComplaint"
        value={formData.chiefComplaint}
        onChange={handleChange}
        maxLength="5000"
      />
      {formErrors.chiefComplaint && <span className="error">{formErrors.chiefComplaint}</span>}
    </div>
    <div className="form-group">
      <label>Consultation Note</label>
      <textarea
        name="consultationNote"
        value={formData.consultationNote}
        onChange={handleChange}
        maxLength="5000"
      />
      {formErrors.consultationNote && <span className="error">{formErrors.consultationNote}</span>}
    </div>
    <div className="form-group">
      <label>Clinic Logo</label>
      <input
        type="file"
        name="clinicLogo"
        onChange={handleFileChange}
        accept="image/*"
      />
    </div>
    <button type="submit">Generate Report</button>
  </form>
);
};

export default ReportForm;