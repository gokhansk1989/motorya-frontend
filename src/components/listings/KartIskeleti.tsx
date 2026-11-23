/**
 * ListingCard ile AYNI siniflar ve satir yukseklikleri: veri gelene kadar
 * kartin yerini birebir tutar, gelince altindaki hicbir sey kaymaz.
 * (390 ve 1440 px'te gercek kartla olculdu; kart degisirse bu da degismeli.)
 */
export function KartIskeleti() {
  return (
    <div className="m-card" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <div className="m-card-media m-iskelet" />
      <div className="m-card-body">
        <div className="m-card-title"><span className="m-iskelet-cizgi" style={{ width: '85%' }}>&nbsp;</span></div>
        <div className="m-price"><span className="m-iskelet-cizgi" style={{ width: '45%' }}>&nbsp;</span></div>
        <div style={{ marginTop: 7, minHeight: 22 }} />
        <div style={{ marginTop: 'auto', paddingTop: 9, minHeight: 27, fontSize: 12.5 }}>&nbsp;</div>
      </div>
    </div>
  );
}
