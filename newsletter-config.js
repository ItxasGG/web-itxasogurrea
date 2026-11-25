/* =========================================================
   Itxaso Gurrea · newsletter-config.js
   Datos de conexión del formulario de la newsletter con HubSpot.
   Si cambias de formulario o de tipo de suscripción en HubSpot,
   cambia solo estos valores.

   - host: servidor de envío de formularios de HubSpot para cuentas
     alojadas en la Unión Europea (región eu1).
   - portalId: número de la cuenta de HubSpot.
   - formGuid: identificador del formulario de HubSpot.
   - subscriptionTypeId: tipo de suscripción «newsletter».

   No hace falta (ni se debe poner) ninguna clave privada ni token.
   ========================================================= */

window.NEWSLETTER_CONFIG = {
  host: "https://api-eu1.hsforms.com",
  portalId: "149846322",
  formGuid: "9a9ff257-7614-4819-9594-1f4536148b5e",
  subscriptionTypeId: 4239316260
};
