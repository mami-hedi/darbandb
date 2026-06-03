import { useState } from "react";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/update-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adapté à votre gestion de session
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        setMessage("Mot de passe mis à jour avec succès.");
        setNewPassword("");
      } else {
        setMessage("Erreur lors de la mise à jour.");
      }
    } catch (err) {
      setMessage("Erreur serveur.");
    }
  };

  return (
    <form onSubmit={handleUpdate} className="p-6 bg-background border border-border">
      <h3 className="text-lg font-medium mb-4">Sécurité : Modifier le mot de passe</h3>
      <input 
        type="password" 
        placeholder="Nouveau mot de passe"
        className="w-full p-2 border border-border mb-4 bg-transparent"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button type="submit" className="bg-foreground text-background px-4 py-2">
        Enregistrer
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}