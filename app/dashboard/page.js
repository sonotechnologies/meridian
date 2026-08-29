"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import Modal from "../components/Modal";
import { getCurrentUser } from "../lib/auth";
import { formatUsd, sanitizeAmountInput, parseAmount } from "../lib/format";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [recipient, setRecipient] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/login");
      return;
    }
    setUser(current);
  }, [router]);

  if (!user) return null;

  const amountValue = parseAmount(amount);

  const errors = {
    recipient: touched.recipient && !recipient.trim() ? "Recipient name is required." : "",
    account:
      touched.account && account.replace(/\D/g, "").length < 6
        ? "Enter a valid account number (at least 6 digits)."
        : "",
    amount:
      touched.amount && (!amountValue || amountValue <= 0)
        ? "Enter an amount greater than $0.00."
        : touched.amount && amountValue > user.balance
        ? "Amount exceeds your available balance."
        : "",
  };

  const isValid =
    recipient.trim() &&
    account.replace(/\D/g, "").length >= 6 &&
    amountValue > 0 &&
    amountValue <= user.balance;

  function handleAmountChange(e) {
    setAmount(sanitizeAmountInput(e.target.value));
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setTouched({ recipient: true, account: true, amount: true });
    if (!isValid) return;

    setSubmitting(true);
    // Simulate a brief processing delay, like a real transfer request.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setShowFailModal(true);
  }

  function closeFailModal() {
    setShowFailModal(false);
    // Form intentionally left filled so the user can see what was entered;
    // clear it if you prefer a fresh form after each attempt.
  }

  return (
    <div className="dash-wrap">
      <TopNav />

      <div className="dash-content">
        <div className="greeting">Welcome back, {user.fullName} 👋</div>
        <div className="greeting-sub">Here's your account overview</div>

        <div className="balance-card">
          <div className="balance-label">AVAILABLE BALANCE</div>
          <div className="balance-amount">{formatUsd(user.balance)}</div>
          <div className="balance-account">
            Account: •••• {user.email.slice(0, 4).toUpperCase()} 
          </div>
        </div>

        <div className="actions-row">
          <div className="action-btn">
            <span className="action-icon">📤</span>
            Transfer
          </div>
          <div className="action-btn">
            <span className="action-icon">📄</span>
            Statements
          </div>
          <div
            className="action-btn"
            onClick={() => router.push("/settings")}
            role="button"
            tabIndex={0}
          >
            <span className="action-icon">⚙️</span>
            Settings
          </div>
        </div>

        <div className="panel">
          <h2>Make a transfer</h2>
          <p className="panel-sub">Simulated transfer — no real funds move.</p>
          <form onSubmit={handleTransfer} noValidate>
            <div className="field">
              <label htmlFor="recipient">Recipient</label>
              <input
                id="recipient"
                type="text"
                placeholder="Recipient name"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, recipient: true }))}
                className={errors.recipient ? "invalid" : ""}
              />
              {errors.recipient && <div className="field-error">{errors.recipient}</div>}
            </div>

            <div className="field">
              <label htmlFor="account">Account number</label>
              <input
                id="account"
                type="text"
                placeholder="000000000"
                value={account}
                onChange={(e) => setAccount(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={() => setTouched((t) => ({ ...t, account: true }))}
                className={errors.account ? "invalid" : ""}
                inputMode="numeric"
              />
              {errors.account && <div className="field-error">{errors.account}</div>}
            </div>

            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                className={errors.amount ? "invalid" : ""}
                inputMode="decimal"
              />
              {amount && !errors.amount && (
                <div className="field-hint">{formatUsd(amountValue)}</div>
              )}
              {errors.amount && <div className="field-error">{errors.amount}</div>}
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner" />
                  Processing…
                </>
              ) : (
                "Send"
              )}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Recent transactions</h2>
          <ul className="tx-list">
            {user.transactions.map((tx) => (
              <li className="tx-item" key={tx.id}>
                <div className="tx-left">
                  <div className="tx-icon">{tx.icon}</div>
                  <div>
                    <div className="tx-name">{tx.name}</div>
                    <div className="tx-date">{tx.date}</div>
                  </div>
                </div>
                <div className={`tx-amount ${tx.amount >= 0 ? "pos" : "neg"}`}>
                  {tx.amount >= 0 ? "+" : ""}
                  {formatUsd(tx.amount)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showFailModal && (
        <Modal
          icon="⚠"
          iconType="error"
          title="Transfer not completed"
          onClose={closeFailModal}
          closeLabel="Okay"
        >
          This transfer could not be processed: Kindly Refer to the admin of the site for restrictions to be lifted.
        </Modal>
      )}
    </div>
  );
}
