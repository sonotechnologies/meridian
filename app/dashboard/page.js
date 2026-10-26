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
    recipient: touched.recipient && !recipient.trim() ? "Der Name des Empfängers ist erforderlich." : "",
    account:
      touched.account && account.replace(/\D/g, "").length < 6
        ? "Geben Sie eine gültige Kontonummer ein (mindestens 6 Ziffern)."
        : "",
    amount:
      touched.amount && (!amountValue || amountValue <= 0)
        ? "Geben Sie einen Betrag größer als 0,00 $ ein."
        : touched.amount && amountValue > user.balance
        ? "Der Betrag übersteigt Ihr verfügbares Guthaben."
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
        <div className="greeting">Willkommen zurück, {user.fullName} 👋</div>
        <div className="greeting-sub">Hier ist eine Übersicht Ihres Kontos</div>

        <div className="balance-card">
          <div className="balance-label">VERFÜGBARES GUTHABEN</div>
          <div className="balance-amount">{formatUsd(user.balance)}</div>
          <div className="balance-account">
            Konto: •••• {user.email.slice(0, 4).toUpperCase()} 
          </div>
        </div>

        <div className="actions-row">
          <div className="action-btn">
            <span className="action-icon">📤</span>
            Überweisen
          </div>
          <div className="action-btn">
            <span className="action-icon">📄</span>
            Kontoauszüge
          </div>
          <div
            className="action-btn"
            onClick={() => router.push("/settings")}
            role="button"
            tabIndex={0}
          >
            <span className="action-icon">⚙️</span>
            Einstellungen
          </div>
        </div>

        <div className="panel">
          <h2>Überweisung tätigen</h2>
          <form onSubmit={handleTransfer} noValidate>
            <div className="field">
              <label htmlFor="recipient">Empfänger</label>
              <input
                id="recipient"
                type="text"
                placeholder="Name des Empfängers"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, recipient: true }))}
                className={errors.recipient ? "invalid" : ""}
              />
              {errors.recipient && <div className="field-error">{errors.recipient}</div>}
            </div>

            <div className="field">
              <label htmlFor="account">Kontonummer</label>
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
              <label htmlFor="amount">Betrag</label>
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
                  Wird verarbeitet…
                </>
              ) : (
                "Senden"
              )}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Letzte Transaktionen</h2>
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
          title="Überweisung nicht abgeschlossen"
          onClose={closeFailModal}
          closeLabel="Okay"
        >
          Diese Überweisung konnte nicht verarbeitet werden. Bitte wenden Sie sich an den Administrator der Website, damit die Einschränkungen aufgehoben werden können.
        </Modal>
      )}
    </div>
  );
}