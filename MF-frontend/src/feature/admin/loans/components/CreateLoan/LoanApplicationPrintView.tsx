// src/feature/admin/loans/components/CreateLoan/LoanApplicationPrintView.tsx
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { LoanFormData } from "./types";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_CENTER_NAME = "SANT SIYARAM SAH SAKHA SASTHA MARYADIT BHOINDA";

function getCenterName(centerId?: string | null) {
  if (centerId === "1c34dc23-daf4-4b6d-8254-d4a232430721") {
    return "GURU KRIPA SAH SAKHA SASTHA MARYADIT DHARAMRAY";
  }

  return DEFAULT_CENTER_NAME;
}

interface Props {
  control: Control<LoanFormData>;
  applicationNo?: string;
}

function fmt(n: number): string {
  return "₹" + (isNaN(n) ? "0" : n.toLocaleString("en-IN"));
}

const sectionTitleStyle = {
  fontSize: "11pt",
  fontWeight: 700,
  margin: "0",
  padding: "5pt 8pt",
  border: "1px solid #000",
  background: "#f3f3f3",
  letterSpacing: "0.4pt",
} as const;

const sectionBoxStyle = {
  border: "1px solid #000",
  padding: "8pt 10pt",
  marginBottom: "10pt",
} as const;

const signatureLineStyle = {
  borderTop: "1px solid #000",
  height: "28pt",
  marginBottom: "4pt",
} as const;

function SectionTitle({ title }: { title: string }) {
  return <h3 style={sectionTitleStyle}>{title}</h3>;
}

function SignatureBlock({
  title,
  width = "48%",
}: {
  title: string;
  width?: string;
}) {
  return (
    <div style={{ width }}>
      <div style={signatureLineStyle} />
      <p style={{ margin: "0", fontWeight: 700 }}>{title}</p>
      <p style={{ margin: "4pt 0 0 0", fontSize: "9pt" }}>
        Date: _________________
      </p>
    </div>
  );
}

// Print field row component
function PrintField({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "42% 58%",
        alignItems: "end",
        gap: "8pt",
        paddingTop: "3pt",
        paddingBottom: "3pt",
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span
        style={{
          textAlign: "left",
          borderBottom: "1px solid #000",
          paddingLeft: "4pt",
          minHeight: "14pt",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {value || "_______________"}
      </span>
    </div>
  );
}

export function LoanApplicationPrintView({ control, applicationNo }: Props) {
  const centreId = useAuthStore((state) => state.user?.centreId);
  const centreName = getCenterName(centreId);

  // Watch all relevant form fields
  const loanType = useWatch({ control, name: "loanType" }) ?? "emi";
  const customerName = useWatch({ control, name: "customerName" }) ?? "";
  const customerPhone = useWatch({ control, name: "customerPhone" }) ?? "";
  const customerAddress = useWatch({ control, name: "customerAddress" }) ?? "";
  const principal = useWatch({ control, name: "principalAmount" }) ?? 0;
  const tenureMonths = useWatch({ control, name: "tenureMonths" }) ?? 0;
  const emiAmount = useWatch({ control, name: "emiAmount" }) ?? 0;
  const fileCharge = useWatch({ control, name: "fileCharge" }) ?? 0;
  const otherCharge = useWatch({ control, name: "otherCharge" }) ?? 0;
  const totalPayable = useWatch({ control, name: "totalPayable" }) ?? 0;
  const emiPaymentMode =
    useWatch({ control, name: "emiPaymentMode" }) ?? "cash";
  const dailyInstallment = useWatch({ control, name: "dailyInstallment" }) ?? 0;
  const totalDays = useWatch({ control, name: "totalDays" }) ?? 0;
  const weeklyInstallment =
    useWatch({ control, name: "weeklyInstallment" }) ?? 0;
  const totalWeeks = useWatch({ control, name: "totalWeeks" }) ?? 0;
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const purposeOfLoan = useWatch({ control, name: "purposeOfLoan" }) ?? "";
  const guarantors = useWatch({ control, name: "guarantors" }) ?? [];
  const familyMembers = useWatch({ control, name: "familyMembers" }) ?? [];
  const aadharNumber = useWatch({ control, name: "aadharNumber" }) ?? "";
  const accountNumber = useWatch({ control, name: "accountNumber" }) ?? "";
  const memberSince = useWatch({ control, name: "memberSince" }) ?? "";
  const fatherOrHusbandName =
    useWatch({ control, name: "fatherOrHusbandName" }) ?? "";
  const hasPreviousLoan =
    useWatch({ control, name: "hasPreviousLoan" }) ?? false;
  const previousLoanAmount =
    useWatch({ control, name: "previousLoanAmount" }) ?? 0;
  const previousLoanStatus =
    useWatch({ control, name: "previousLoanStatus" }) ?? "";
  const notes = useWatch({ control, name: "notes" }) ?? "";

  const totalCharges = fileCharge + otherCharge;
  const disbursed = principal - totalCharges;
  const previousLoanTakenText = hasPreviousLoan ? "हाँ (Yes)" : "नहीं (No)";

  return (
    <>
      <div
        id="loan-print-document"
        className="print-container"
        style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: "10.5pt",
          lineHeight: "1.35",
          color: "#000",
          background: "#fff",
          width: "100%",
          maxWidth: "8.27in",
          margin: "0 auto",
          padding: "14pt 16pt 18pt",
          boxSizing: "border-box",
          border: "1.5px solid #000",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "8pt" }}>
          <h2
            style={{
              fontSize: "13pt",
              fontWeight: 700,
              margin: "0 0 4pt 0",
              textTransform: "uppercase",
              letterSpacing: "0.4pt",
            }}
          >
            {centreName}
          </h2>
        </div>

        {/* Document Title */}
        <div style={{ textAlign: "center", marginBottom: "10pt" }}>
          <h1
            style={{
              fontSize: "14pt",
              fontWeight: 700,
              margin: "0 0 4pt 0",
              textTransform: "uppercase",
              letterSpacing: "0.5pt",
            }}
          >
            LOAN APPLICATION FORM
          </h1>
          <p style={{ fontSize: "9pt", margin: "0", color: "#000" }}>
            Date: {new Date().toLocaleDateString("en-IN")}
          </p>
        </div>

        {/* SECTION 1 — APPLICANT DETAILS */}
        <div style={sectionBoxStyle}>
          <SectionTitle title="खंड 1 — आवेदन कर्ता की जानकारी (Applicant Details)" />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12pt",
              paddingTop: "6pt",
            }}
          >
            <div style={{ flex: 1 }}>
              <PrintField
                label="आवेदन संख्या (Application No.)"
                value={applicationNo ?? ""}
              />
              <PrintField label="पूरा नाम (Full Name)" value={customerName} />
              <PrintField
                label="दिनांक (Date)"
                value={
                  startDate
                    ? new Date(startDate).toLocaleDateString("en-IN")
                    : ""
                }
              />
              <PrintField
                label="पिता / पति का नाम (Father/Husband Name)"
                value={fatherOrHusbandName}
              />
              <PrintField label="Account No." value={accountNumber} />
              <PrintField label="Mobile No." value={customerPhone} />
              <PrintField label="Aadhar No." value={aadharNumber} />
              <PrintField label="पता (Address)" value={customerAddress} />
              <PrintField
                label="सदस्य कितने समय से हैं (Member Since)"
                value={
                  memberSince
                    ? new Date(memberSince).toLocaleDateString("en-IN")
                    : ""
                }
              />
            </div>
            <div
              style={{
                width: "28%",
                minWidth: "120pt",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "125pt",
                  border: "1px solid #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "8pt",
                  fontSize: "10pt",
                  fontWeight: 700,
                }}
              >
                पासपोर्ट फोटो
                <br />
                यहाँ चिपकाएँ
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — LOAN DETAILS */}
        <div style={sectionBoxStyle}>
          <SectionTitle title="खंड 2 — ऋण विवरण (Loan Details)" />
          <PrintField label="Loan Type" value={loanType.toUpperCase()} />
          <PrintField
            label="माँगी गई राशि (Loan Amount Requested)"
            value={fmt(principal)}
          />
          <PrintField
            label="ऋण का उद्देश्य (Purpose of Loan)"
            value={purposeOfLoan}
          />
          <PrintField label="Processing Charges" value={fmt(totalCharges)} />

          {loanType === "emi" && (
            <>
              <PrintField
                label="अवधि (Duration)"
                value={tenureMonths ? `${tenureMonths} महीने` : ""}
              />
              <PrintField
                label="मासिक किश्त / EMI (Monthly EMI)"
                value={fmt(emiAmount)}
              />
            </>
          )}

          {loanType === "bullet" && (
            <>
              <PrintField
                label="अवधि (Duration)"
                value={tenureMonths ? `${tenureMonths} महीने` : ""}
              />
            </>
          )}

          {loanType === "flexible" && (
            <>
              <PrintField
                label="अवधि (Duration)"
                value={totalDays ? `${totalDays} दिन` : ""}
              />
              <PrintField
                label="Daily Installment"
                value={fmt(dailyInstallment)}
              />
            </>
          )}

          {loanType === "weekly" && (
            <>
              <PrintField
                label="अवधि (Duration)"
                value={totalWeeks ? `${totalWeeks} सप्ताह` : ""}
              />
              <PrintField
                label="Weekly Amount"
                value={fmt(weeklyInstallment)}
              />
            </>
          )}

          <PrintField
            label="वितरित राशि (Disbursed Amount)"
            value={fmt(disbursed)}
          />
          <PrintField
            label="कुल देय राशि (Total Repayment Amount)"
            value={fmt(totalPayable)}
          />
          <PrintField
            label="पहली किश्त की तारीख (First EMI Date)"
            value={
              startDate ? new Date(startDate).toLocaleDateString("en-IN") : ""
            }
          />
          <PrintField
            label="EMI भुगतान का तरीका (Payment Mode)"
            value={emiPaymentMode.toUpperCase()}
          />
          <div style={{ marginTop: "10pt" }}>
            <SignatureBlock
              title="आवेदन कर्ता के हस्ताक्षर (Applicant Signature)"
              width="55%"
            />
          </div>
        </div>

        {/* SECTION 3 — GUARANTOR DETAILS */}
        {guarantors.length > 0 && (
          <div style={sectionBoxStyle}>
            <SectionTitle title="खंड 3 — जमानत (Guarantor Details)" />
            {guarantors.map((guarantor, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx === guarantors.length - 1 ? "0" : "10pt",
                  paddingBottom: "8pt",
                  borderBottom:
                    idx === guarantors.length - 1 ? "none" : "1px dashed #777",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    margin: "4pt 0 6pt",
                    textDecoration: "underline",
                  }}
                >
                  जमानतदार {idx + 1} (Guarantor {idx + 1})
                </p>
                <PrintField
                  label="जमानतदार का नाम (Name)"
                  value={guarantor.name}
                />
                <PrintField label="Mobile" value={guarantor.phone} />
                <PrintField
                  label="संबंध (Relation)"
                  value={guarantor.relation}
                />
                <PrintField label="पता (Address)" value={guarantor.address} />
                <div style={{ marginTop: "8pt", width: "60%" }}>
                  <div style={signatureLineStyle} />
                  <p style={{ margin: "0", fontWeight: 700 }}>
                    जमानतदार के हस्ताक्षर (Guarantor Signature)
                  </p>
                  <p style={{ margin: "4pt 0 0 0", fontSize: "9pt" }}>
                    दिनांक (Date): _________________
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 4 — FAMILY DETAILS */}
        {familyMembers.length > 0 && (
          <div style={sectionBoxStyle}>
            <SectionTitle title="खंड 4 — परिवार के सदस्य की जानकारी (Family Member Details)" />
            {familyMembers.map((member, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx === familyMembers.length - 1 ? "0" : "10pt",
                  paddingBottom: "8pt",
                  borderBottom:
                    idx === familyMembers.length - 1
                      ? "none"
                      : "1px dashed #777",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    margin: "4pt 0 6pt",
                    textDecoration: "underline",
                  }}
                >
                  सदस्य {idx + 1} (Family Member {idx + 1})
                </p>
                <PrintField label="सदस्य का नाम (Name)" value={member.name} />
                <PrintField label="संबंध (Relation)" value={member.relation} />
                <PrintField label="Mobile" value={member.phone} />
                <PrintField
                  label="Aadhar No."
                  value={member.aadharNumber || ""}
                />
                <div style={{ marginTop: "8pt", width: "60%" }}>
                  <div style={signatureLineStyle} />
                  <p style={{ margin: "0", fontWeight: 700 }}>
                    परिवार सदस्य के हस्ताक्षर (Family Member Signature)
                  </p>
                  <p style={{ margin: "4pt 0 0 0", fontSize: "9pt" }}>
                    दिनांक (Date): _________________
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 5 — PREVIOUS LOAN */}
        <div style={sectionBoxStyle}>
          <SectionTitle title="खंड 5 — पूर्व ऋण विवरण (Previous Loan, if any)" />
          <PrintField
            label="क्या पहले ऋण लिया है? (Previous Loan Taken?)"
            value={previousLoanTakenText}
          />
          <PrintField
            label="यदि हाँ, राशि (If Yes, Amount)"
            value={previousLoanAmount ? fmt(previousLoanAmount) : ""}
          />
          <PrintField label="Status" value={previousLoanStatus} />
          <div style={{ marginTop: "10pt", width: "55%" }}>
            <div style={signatureLineStyle} />
            <p style={{ margin: "0", fontWeight: 700 }}>
              हस्ताक्षर (Signature)
            </p>
          </div>
        </div>

        {/* SECTION 6 — DECLARATION */}
        <div style={sectionBoxStyle}>
          <SectionTitle title="खंड 6 — घोषणा (Declaration)" />
          <PrintField
            label="दिनांक (Date)"
            value={
              startDate ? new Date(startDate).toLocaleDateString("en-IN") : ""
            }
          />
          <p style={{ margin: "8pt 0 10pt", textAlign: "justify" }}>
            मैं यह घोषणा करता / करती हूँ कि उपर दी गई समस्त जानकारी सत्य है। यदि
            कोई जानकारी असत्य पाई गई तो मैं उसके लिए उत्तरदायी रहूँगा / रहूँगी।
          </p>

          <p style={{ margin: "0 0 8pt", fontWeight: 700 }}>
            ★ कृपया नीचे अपने हाथ से घोषणा लिखें (Please write the declaration
            below in your own handwriting):
          </p>

          {/* 4 Lines for handwritten declaration */}
          <div style={{ marginBottom: "10pt" }}>
            <div
              style={{
                borderBottom: "1px solid #000",
                height: "18pt",
                marginBottom: "7pt",
              }}
            />
            <div
              style={{
                borderBottom: "1px solid #000",
                height: "18pt",
                marginBottom: "7pt",
              }}
            />
            <div
              style={{
                borderBottom: "1px solid #000",
                height: "18pt",
                marginBottom: "7pt",
              }}
            />
            <div
              style={{
                borderBottom: "1px solid #000",
                height: "18pt",
                marginBottom: "10pt",
              }}
            />
          </div>

          {/* Signature Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12pt",
              marginTop: "12pt",
            }}
          >
            <SignatureBlock title="आवेदन कर्ता का हस्ताक्षर (Applicant Signature)" />
            <SignatureBlock title="अधिकारी का हस्ताक्षर (Authorized Officer)" />
          </div>
        </div>

        {/* SECTION 7 — OFFICE USE ONLY */}
        <div style={sectionBoxStyle}>
          <SectionTitle title="खंड 7 — कार्यालय उपयोग हेतु (Office Use Only)" />
          <PrintField
            label="स्वीकृति (Swikriti)"
            value={"Approved / Rejected"}
          />
          <PrintField label="Officer Name" value={""} />
          <PrintField label="Designation" value={""} />
          <PrintField label="Remarks / टिप्पणी" value={notes} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12pt",
              marginTop: "10pt",
            }}
          >
            <SignatureBlock title="हस्ताक्षर (Signature)" />
            <div style={{ width: "48%" }}>
              <div
                style={{
                  border: "1px solid #000",
                  height: "52pt",
                  padding: "6pt",
                }}
              >
                <div
                  style={{
                    fontSize: "9pt",
                    fontWeight: 700,
                    marginBottom: "4pt",
                  }}
                >
                  Seal
                </div>
                <div style={{ fontSize: "9pt" }}>
                  ____________________________
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
