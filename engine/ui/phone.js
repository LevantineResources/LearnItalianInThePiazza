/* The phone: its Messaggi tab (the unit's texts: UNIT.phoneMessages()) and the tabs of ui/quests.js. */

/* ---------- phone ---------- */
function openPhone(tab){
  if (introOpen || !unitHook('phoneShown')) return;
  S.phoneUnread = false; save(); renderHUD();
  openModal('phone');
  /* Lesson 12 on: the tabs, Messaggi · Compiti · Borsa · Passaporto (ui/quests.js) */
  PHONE_TAB = phoneTabsOn() ? (tab || PHONE_TAB || 'msg') : 'msg';
  if (PHONE_TAB !== 'msg'){ sheet.innerHTML = `<div class="phone-screen tab-${PHONE_TAB}">${phoneTabHTML(PHONE_TAB)}${phoneTabBar()}</div>`; return; }
  if (unitHook('phoneMessages')) return;            // the unit's messages (Padova: Mark's texts, Lessons 3 and 5)
  sheet.innerHTML = `<div class="phone-screen">
    <div class="phone-top"><div><b>Messaggi</b></div><button class="x" data-close aria-label="Close phone">×</button></div>
    <div class="msgs"><p class="note">No messages.</p></div>${phoneTabBar()}</div>`;
}
