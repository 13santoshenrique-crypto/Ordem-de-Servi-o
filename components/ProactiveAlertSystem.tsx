import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getPredictiveMaintenance } from '../services/geminiService';
import { OSStatus } from '../types';

export const ProactiveAlertSystem: React.FC = () => {
  const { assets, inventory, orders, addNotification } = useApp();

  useEffect(() => {
    const runChecks = async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const checkKey = `aviagen_alerts_checked_${todayStr}`;
      
      // Prevent spamming checks on every reload, but allow if data changes significantly?
      // For now, let's run once per session or day. 
      // Actually, for inventory/OS/assets, we might want real-time-ish updates.
      // But for AI, definitely once per day.
      
      // --- 1. INVENTORY CHECKS (Real-time-ish, but debounced by key if needed, or just run always on mount) ---
      // We'll use a session key to avoid repeated alerts for the same item in the same session
      const sessionKey = `aviagen_session_alerts`;
      const sentAlerts = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');

      inventory.forEach(item => {
        if (item.stock <= item.minStock) {
          const alertId = `inv_low_${item.id}`;
          if (!sentAlerts.includes(alertId)) {
            addNotification({
              type: 'warning',
              title: 'Estoque Baixo',
              message: `O item "${item.name}" atingiu o nível mínimo (${item.stock} ${item.unit}). Reposição necessária.`
            });
            sentAlerts.push(alertId);
          }
        }
      });

      // --- 2. ASSET CHECKS ---
      assets.forEach(asset => {
        // Reliability
        if (asset.reliabilityIndex < 50) {
           const alertId = `asset_rel_${asset.id}`;
           if (!sentAlerts.includes(alertId)) {
             addNotification({
               type: 'critical',
               title: 'Risco de Ativo',
               message: `O ativo ${asset.tag} está com confiabilidade crítica (${asset.reliabilityIndex}%). Verifique imediatamente.`
             });
             sentAlerts.push(alertId);
           }
        }

        // Documents
        if (asset.documents) {
          asset.documents.forEach(doc => {
            if (doc.expirationDate) {
              const expDate = new Date(doc.expirationDate);
              const diffTime = expDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays <= 30) {
                 const alertId = `doc_exp_${doc.id}`;
                 if (!sentAlerts.includes(alertId)) {
                    const type = diffDays < 0 ? 'critical' : 'warning';
                    const title = diffDays < 0 ? 'Documento Vencido' : 'Vencimento Próximo';
                    const msg = diffDays < 0 
                        ? `O documento "${doc.name}" do ativo ${asset.tag} expirou em ${expDate.toLocaleDateString()}.`
                        : `O documento "${doc.name}" do ativo ${asset.tag} vence em ${diffDays} dias.`;

                    addNotification({ type, title, message: msg });
                    sentAlerts.push(alertId);
                 }
              }
            }
          });
        }
      });

      // --- 3. OS CHECKS ---
      orders.forEach(os => {
         if (os.status === OSStatus.OPEN && os.deadline) {
            const deadline = new Date(os.deadline);
            const diffTime = deadline.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 2 && diffDays >= 0) {
               const alertId = `os_deadline_${os.id}`;
               if (!sentAlerts.includes(alertId)) {
                  addNotification({
                    type: 'warning',
                    title: 'Prazo de OS Próximo',
                    message: `A OS #${os.id} vence em ${diffDays} dias. Priorize o atendimento.`
                  });
                  sentAlerts.push(alertId);
               }
            } else if (diffDays < 0) {
               const alertId = `os_overdue_${os.id}`;
               if (!sentAlerts.includes(alertId)) {
                  addNotification({
                    type: 'critical',
                    title: 'OS Atrasada',
                    message: `A OS #${os.id} está atrasada desde ${deadline.toLocaleDateString()}.`
                  });
                  sentAlerts.push(alertId);
               }
            }
         }
      });

      sessionStorage.setItem(sessionKey, JSON.stringify(sentAlerts));

      // --- 4. AI PREDICTIVE CHECKS (Once per day) ---
      if (!localStorage.getItem(checkKey) && orders.length > 0) {
         try {
            // Only run if we haven't checked today
            const risks = await getPredictiveMaintenance(orders);
            if (risks && risks.length > 0) {
               const highRisks = risks.filter(r => r.riskLevel.toLowerCase().includes('alto') || r.riskLevel.toLowerCase().includes('crítico'));
               
               highRisks.forEach(risk => {
                  addNotification({
                     type: 'critical',
                     title: 'Alerta Preditivo IA',
                     message: `Detectado risco ${risk.riskLevel} em ${risk.equipment}. Probabilidade de falha: ${Math.round(risk.probability * 100)}%. Verifique o Módulo IA.`
                  });
               });
            }
            localStorage.setItem(checkKey, 'true');
         } catch (e) {
            console.error("Failed to run AI checks", e);
         }
      }
    };

    const timer = setTimeout(runChecks, 3000); // Delay start to allow app to load
    return () => clearTimeout(timer);

  }, [assets, inventory, orders, addNotification]);

  return null;
};
