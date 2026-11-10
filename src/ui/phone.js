/* Phone and text messages. */

/* ---------- phone ---------- */
function openPhone(tab){
  if (introOpen || S.lesson < 3) return;
  S.phoneUnread = false; save(); renderHUD();
  openModal('phone');
  /* Lesson 12 on: the tabs, Messaggi · Compiti · Borsa · Passaporto (ui/quests.js) */
  PHONE_TAB = phoneTabsOn() ? (tab || PHONE_TAB || 'msg') : 'msg';
  if (PHONE_TAB !== 'msg'){ sheet.innerHTML = `<div class="phone-screen tab-${PHONE_TAB}">${phoneTabHTML(PHONE_TAB)}${phoneTabBar()}</div>`; return; }
  const msgs = [{ me:false, it:"Hey {Me}! It's Mark. Just landed! Meet me at Caffè Aurora, Via dei Mille 12? 11am!", time:'10:32' },
                { me:false, it:"Fair warning: the only Italian I know is “pizza”.", time:'10:32' }];
  if (S.phoneReplied){ msgs.push({ me:true, it:'See you there!', time:'10:33' }); msgs.push({ me:false, it:'Great! Phone about to die. See you soon!', time:'10:33' }); }
  const l5 = S.lesson >= 5;
  if (l5){
    msgs.push({ me:false, it:'Good morning! Want to see some art today? There is a famous Donatello statue somewhere in town. A guy on a horse.', time:'Il giorno dopo · 9:05' });
    msgs.push({ me:false, it:"Meet me in the piazza by the fountain! I'll try asking for directions myself. How hard can it be?", time:'9:05' });
    if (S.phoneReplied5){ msgs.push({ me:true, it:'On my way!', time:'9:06' }); }
  }
  const replied = l5 ? S.phoneReplied5 : S.phoneReplied;
  sheet.innerHTML = `<div class="phone-screen">
    <div class="phone-top"><span class="avatar">M</span><div><b>Mark</b><small>Messaggi</small></div><button class="x" data-close aria-label="Close phone">×</button></div>
    <div class="addr"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>${S.lesson >= 5 ? 'La fontana · Piazza Centrale' : 'Caffè Aurora · Via dei Mille 12'}</div>
    <div class="msgs">${msgs.map(m => `<div class="msg ${m.me ? 'me' : 'them'}">${esc(fill(m.it))}${m.en ? `<span class="en" hidden>${esc(fill(m.en))}</span>` : ''}<span class="time">${m.time}</span></div>`).join('')}</div>
    <div class="replies">
      ${replied ? '<button class="btn primary" data-close>Close</button>' : `<button class="btn primary" id="reply1">${l5 ? 'On my way!' : 'See you there!'}</button>`}
    </div>${phoneTabBar()}</div>`;
  const r = $('#reply1');
  if (r) r.onclick = () => {
    if (l5){ S.phoneReplied5 = true; if (S.tut === 'l5-text') S.tut = 'l5-meet'; }
    else S.phoneReplied = true;
    if (S.tut === 'l3-text') S.tut = 'l3-ask';
    save(); openPhone('msg');
  };
  if (S.tut === 'l3-text' && S.phoneReplied){ setTut('l3-ask'); }
}
