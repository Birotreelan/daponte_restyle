'use client'

/**
 * Formatters de detalle clínico de la Historia Clínica -- réplica 1:1 de
 * los ~35 setup/p_hc/frmt_*.php que el legacy paciente.php incluye vía
 * setup/p_hc/formato_practicas.php, para cada Practica_Codigo.
 *
 * Cada función recibe la fila cruda de la tabla satélite (tree_<tabla>,
 * ver api/paciente_practica_detalle.php) y devuelve un string HTML que
 * reproduce el `echo` del original -- incluyendo bugs documentados (no se
 * corrigen silenciosamente, ver comentarios "BUG LEGACY" en cada caso).
 *
 * A diferencia del PHP original (que interpola directamente sin escapar,
 * un vector de XSS ya existente en producción), acá se escapa cada valor
 * dinámico antes de insertarlo en el HTML -- el <br> y las tablas propias
 * del formatter siguen siendo HTML literal para preservar el layout, pero
 * ningún dato cargado por un usuario puede inyectar markup.
 *
 * `tree` = { Fecha, Hora } de la entrada (algunos formatters, ej. frmt_cir,
 * usan la Hora de la entrada -- no de la práctica -- para mostrar texto).
 */

export interface PracticaTreeCtx {
  Fecha: string
  Hora: string
}

type P = Record<string, unknown>

function s(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

/** Escapa HTML -- se aplica a todo valor dinámico interpolado. */
function esc(v: unknown): string {
  return s(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Replica el chequeo PHP `!$x==""` (que por precedencia de operadores
 * equivale a "$x es truthy"): falsy solo si $x es null/undefined/""/"0".
 */
function ne(v: unknown): boolean {
  const str = s(v)
  return str !== '' && str !== '0'
}

function nl2br(v: unknown): string {
  return esc(v).replace(/\n/g, '<br>')
}

function br(): string {
  return '<br>'
}

/** Tabla de 3x3 compartida por frmt_cvt1.php (Cover Test) y frmt_paq.php (Paquimetria). */
function tablaGrilla3x3(p: P, tituloHtml: string): string {
  const campos = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']
  if (campos.every((c) => !ne(p[c]))) return ''
  const cell = (c: string) => (ne(p[c]) ? esc(p[c]) : '&nbsp;')
  return `${tituloHtml}<table style="border-collapse:collapse" width="226">
  <tr>
    <td width="74" align="center" valign="middle">${cell('A1')}</td>
    <td width="2" style="background:#666"></td>
    <td width="74" align="center" valign="middle">${cell('A2')}</td>
    <td width="2" style="background:#666"></td>
    <td width="74" align="center" valign="middle">${cell('A3')}</td>
  </tr>
  <tr><td colspan="5" height="2" style="background:#666"></td></tr>
  <tr>
    <td width="68" align="center" valign="middle">${cell('B1')}</td>
    <td width="2" style="background:#666"></td>
    <td width="68" align="center" valign="middle">${cell('B2')}</td>
    <td width="2" style="background:#666"></td>
    <td width="68" align="center" valign="middle">${cell('B3')}</td>
  </tr>
  <tr><td colspan="5" height="2" style="background:#666"></td></tr>
  <tr>
    <td width="68" align="center" valign="middle">${cell('C1')}</td>
    <td width="2" style="background:#666"></td>
    <td width="68" align="center" valign="middle">${cell('C2')}</td>
    <td width="2" style="background:#666"></td>
    <td width="68" align="center" valign="middle">${cell('C3')}</td>
  </tr>
</table><br>`
}

// ---------------------------------------------------------------------
// frmt_exo.php (Ex Oculoplastica) -- 6 tablas independientes, cada una
// mostrada solo si alguno de sus campos no está vacío. BUG LEGACY: el
// título "Ex Oculoplastica:" se arma en una variable ($exo) que el
// original nunca llega a hacer echo -- por eso acá no hay título.
// ---------------------------------------------------------------------
function frmtExo(p: P): string {
  let out = ''

  if (['DrmOD', 'DrmOI', 'Drm2OD', 'Drm2OI', 'FepsOD', 'FepsOI', 'CejasOD', 'CejasOI'].some((c) => ne(p[c]))) {
    out += `<table width="300" border="0" cellspacing="0" cellpadding="0">
  <tr><td width="20">&nbsp;</td><td width="70" align="center"><strong>DRM</strong></td><td width="70" align="center"><strong>DRM2</strong></td><td width="70" align="center"><strong>FEPS</strong></td><td width="70" align="center"><strong>Cejas</strong></td></tr>
  <tr><td align="left"><strong>OD</strong></td><td align="center">${esc(p.DrmOD)}</td><td align="center">${esc(p.Drm2OD)}</td><td align="center">${esc(p.FepsOD)}</td><td align="center">${esc(p.CejasOD)}</td></tr>
  <tr><td align="left"><strong>OI</strong></td><td align="center">${esc(p.DrmOI)}</td><td align="center">${esc(p.Drm2OI)}</td><td align="center">${esc(p.FepsOI)}</td><td align="center">${esc(p.CejasOI)}</td></tr>
</table><br>`
  }

  if (['PinfOD', 'PinfOI', 'EsclOD', 'EsclOI', 'LaxitudOD', 'LaxitudOI', 'LagoftOD', 'LagoftOI'].some((c) => ne(p[c]))) {
    out += `<table width="300" border="0" cellspacing="0" cellpadding="0">
  <tr><td width="20">&nbsp;</td><td width="70" align="center"><strong>P. Inf</strong></td><td width="70" align="center"><strong>Escl</strong></td><td width="70" align="center"><strong>Laxitud</strong></td><td width="70" align="center"><strong>Lagoft</strong></td></tr>
  <tr><td align="left"><strong>OD</strong></td><td align="center">${esc(p.PinfOD)}</td><td align="center">${esc(p.EsclOD)}</td><td align="center">${esc(p.LaxitudOD)}</td><td align="center">${esc(p.LagoftOD)}</td></tr>
  <tr><td align="left"><strong>OI</strong></td><td align="center">${esc(p.PinfOI)}</td><td align="center">${esc(p.EsclOI)}</td><td align="center">${esc(p.LaxitudOI)}</td><td align="center">${esc(p.LagoftOI)}</td></tr>
</table><br>`
  }

  if (['RbellOD', 'RbellOI', 'HerringOD', 'HerringOI'].some((c) => ne(p[c]))) {
    out += `<table width="160" border="0" cellspacing="0" cellpadding="0">
  <tr><td width="20">&nbsp;</td><td width="70" align="center"><strong>R. Bell</strong></td><td width="70" align="center"><strong>Herring</strong></td></tr>
  <tr><td align="left"><strong>OD</strong></td><td align="center">${esc(p.RbellOD)}</td><td align="center">${esc(p.HerringOD)}</td></tr>
  <tr><td align="left"><strong>OI</strong></td><td align="center">${esc(p.RbellOI)}</td><td align="center">${esc(p.HerringOI)}</td></tr>
</table><br>`
  }

  if (['LagosOD', 'LagosOI', 'PAsupOD', 'PAsupOI', 'PAinfOD', 'PAinfOI', 'ReflOD', 'ReflOI'].some((c) => ne(p[c]))) {
    out += `<table width="300" border="0" cellspacing="0" cellpadding="0">
  <tr><td width="20">&nbsp;</td><td width="70" align="center"><strong>Lagos</strong></td><td width="70" align="center"><strong>P. Sup</strong></td><td width="70" align="center"><strong>P. Inf</strong></td><td width="70" align="center"><strong>Reflujo</strong></td></tr>
  <tr><td align="left"><strong>OD</strong></td><td align="center">${esc(p.LagosOD)}</td><td align="center">${esc(p.PAsupOD)}</td><td align="center">${esc(p.PAinfOD)}</td><td align="center">${esc(p.ReflOD)}</td></tr>
  <tr><td align="left"><strong>OI</strong></td><td align="center">${esc(p.LagosOI)}</td><td align="center">${esc(p.PAsupOI)}</td><td align="center">${esc(p.PAinfOI)}</td><td align="center">${esc(p.ReflOI)}</td></tr>
</table><br>`
  }

  if (['DdtOD', 'DdtOI', 'IrrigOD', 'IrrigOI', 'EndoscOD', 'EndoscOI'].some((c) => ne(p[c]))) {
    out += `<table width="230" border="0" cellspacing="0" cellpadding="0">
  <tr><td width="20">&nbsp;</td><td width="70" align="center"><strong>DDT</strong></td><td width="70" align="center"><strong>Irrig</strong></td><td width="70" align="center"><strong>Endosc</strong></td></tr>
  <tr><td align="left"><strong>OD</strong></td><td align="center">${esc(p.DdtOD)}</td><td align="center">${esc(p.IrrigOD)}</td><td align="center">${esc(p.EndoscOD)}</td></tr>
  <tr><td align="left"><strong>OI</strong></td><td align="center">${esc(p.DdtOI)}</td><td align="center">${esc(p.IrrigOI)}</td><td align="center">${esc(p.EndoscOI)}</td></tr>
</table><br>`
  }

  if (
    ['ExoftOD', 'Exoft1OI', 'RetropOD', 'RetropOI', 'PCVOD', 'PCVOI', 'PCVIIOD', 'PCVIIOI'].some((c) => ne(p[c]))
  ) {
    out += `<table width="300" border="0" cellspacing="0" cellpadding="0">
  <tr><td width="20">&nbsp;</td><td width="70" align="center"><strong>Exoft</strong></td><td width="70" align="center"><strong>Retrop</strong></td><td width="70" align="center"><strong>PC V</strong></td><td width="70" align="center"><strong>PC VII</strong></td></tr>
  <tr><td align="left"><strong>OD</strong></td><td align="center">${esc(p.ExoftOD)}</td><td align="center">${esc(p.RetropOD)}</td><td align="center">${esc(p.PCVOD)}</td><td align="center">${esc(p.PCVIIOD)}</td></tr>
  <tr><td align="left"><strong>OI</strong></td><td align="center">${esc(p.Exoft1OI)} - ${esc(p.Exoft2OI)}</td><td align="center">${esc(p.RetropOI)}</td><td align="center">${esc(p.PCVOI)}</td><td align="center">${esc(p.PCVIIOI)}</td></tr>
</table><br>`
  }

  return out
}

// ---------------------------------------------------------------------
// frmt_ref.php (Refraccion) -- el formatter más grande del legacy.
// El botón "Imprimir Receta" y el link "editar" se omiten (acciones,
// fuera de alcance de esta pasada de solo-lectura).
// ---------------------------------------------------------------------
function frmtRef(p: P): string {
  let out = ''

  if (ne(p.Sin_correccion_lejos_od) || ne(p.Sin_correccion_lejos_oi)) {
    out += `A.V. sin corrección Lejos:&nbsp; OD: ${esc(p.Sin_correccion_lejos_od)} OI: ${esc(p.Sin_correccion_lejos_oi)}${br()}`
  }
  if (ne(p.Sin_correccion_cerca_od) || ne(p.Sin_correccion_cerca_oi)) {
    out += `A.V. sin corrección Cerca:&nbsp; OD:${esc(p.Sin_correccion_cerca_od)} OI:${esc(p.Sin_correccion_cerca_oi)}${br()}`
  }
  const iolOd = s(p.Sin_correccion_iol_od) === '1' ? 'IOL en OD' : ''
  const iolOi = s(p.Sin_correccion_iol_oi) === '1' ? 'IOL en OI' : ''
  out += `${iolOd} ${iolOi}${br()}`

  if (
    ne(p.Anterior_lejos_esf_od) ||
    ne(p.Anterior_lejos_cil_od) ||
    ne(p.Anterior_lejos_eje_od) ||
    ne(p.Anterior_agudeza_od) ||
    ne(p.Anterior_lejos_esf_oi) ||
    ne(p.Anterior_lejos_cil_oi) ||
    ne(p.Anterior_lejos_eje_oi) ||
    ne(p.Anterior_agudeza_oi)
  ) {
    out += `Antejos Anteriores:<br>Lejos:&nbsp; OD: Esf: ${esc(p.Anterior_lejos_esf_od)} Cil: ${esc(p.Anterior_lejos_cil_od)} Eje: ${esc(p.Anterior_lejos_eje_od)} AV: ${esc(p.Anterior_agudeza_od)}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OI: Esf: ${esc(p.Anterior_lejos_esf_oi)} Cil: ${esc(p.Anterior_lejos_cil_oi)} Eje: ${esc(p.Anterior_lejos_eje_oi)} AV: ${esc(p.Anterior_agudeza_oi)}<br>`
  }
  if (
    ne(p.Anterior_cerca_esf_od) ||
    ne(p.Anterior_cerca_cil_od) ||
    ne(p.Anterior_cerca_eje_od) ||
    ne(p.Anterior_j_od) ||
    ne(p.Anterior_cerca_esf_oi) ||
    ne(p.Anterior_cerca_cil_oi) ||
    ne(p.Anterior_cerca_eje_oi) ||
    ne(p.Anterior_j_oi)
  ) {
    out += `Cerca:&nbsp; OD: Esf: ${esc(p.Anterior_cerca_esf_od)} Cil: ${esc(p.Anterior_cerca_cil_od)} Eje: ${esc(p.Anterior_cerca_eje_od)} J: ${esc(p.Anterior_j_od)}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OI: Esf: ${esc(p.Anterior_cerca_esf_oi)} Cil: ${esc(p.Anterior_cerca_cil_oi)} Eje: ${esc(p.Anterior_cerca_eje_oi)} J: ${esc(p.Anterior_j_oi)}<br>`
  }

  if (ne(p.Anterior_lc_agudeza_od) || ne(p.Anterior_lc_agudeza_oi)) {
    out += `AV con LC Anteriores:&nbsp; OD: AV: ${esc(p.Anterior_lc_agudeza_od)} - OI: AV: ${esc(p.Anterior_lc_agudeza_oi)}<br>`
    if (ne(p.LCAV_Desc)) out += `Tipo: ${esc(p.LCAV_Desc)}<br>`
  }

  let recetaPrint = false
  if (
    ne(p.Subjetiva_lejos_esf_od) ||
    ne(p.Subjetiva_lejos_cil_od) ||
    ne(p.Subjetiva_lejos_eje_od) ||
    ne(p.Subjetiva_agudeza_od) ||
    ne(p.Subjetiva_lejos_esf_oi) ||
    ne(p.Subjetiva_lejos_cil_oi) ||
    ne(p.Subjetiva_lejos_eje_oi) ||
    ne(p.Subjetiva_agudeza_oi)
  ) {
    out += `Subjetiva:<br>Lejos:&nbsp; OD: Esf: ${esc(p.Subjetiva_lejos_esf_od)} Cil: ${esc(p.Subjetiva_lejos_cil_od)} Eje: ${esc(p.Subjetiva_lejos_eje_od)} AV: ${esc(p.Subjetiva_agudeza_od)}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OI: Esf: ${esc(p.Subjetiva_lejos_esf_oi)} Cil: ${esc(p.Subjetiva_lejos_cil_oi)} Eje: ${esc(p.Subjetiva_lejos_eje_oi)} AV: ${esc(p.Subjetiva_agudeza_oi)}<br>`
    recetaPrint = true
  }
  if (
    ne(p.Subjetiva_media_esf_od) ||
    ne(p.Subjetiva_media_cil_od) ||
    ne(p.Subjetiva_media_eje_od) ||
    ne(p.Subjetiva_media_esf_oi) ||
    ne(p.Subjetiva_media_cil_oi) ||
    ne(p.Subjetiva_media_eje_oi)
  ) {
    out += `Subjetiva:<br>Media:&nbsp; OD: Esf: ${esc(p.Subjetiva_media_esf_od)} Cil: ${esc(p.Subjetiva_media_cil_od)} Eje: ${esc(p.Subjetiva_media_eje_od)}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OI: Esf: ${esc(p.Subjetiva_media_esf_oi)} Cil: ${esc(p.Subjetiva_media_cil_oi)} Eje: ${esc(p.Subjetiva_media_eje_oi)}<br>`
    recetaPrint = true
  }
  if (
    ne(p.Subjetiva_cerca_esf_od) ||
    ne(p.Subjetiva_cerca_cil_od) ||
    ne(p.Subjetiva_cerca_eje_od) ||
    ne(p.Subjetiva_j_od) ||
    ne(p.Subjetiva_cerca_esf_oi) ||
    ne(p.Subjetiva_cerca_cil_oi) ||
    ne(p.Subjetiva_cerca_eje_oi) ||
    ne(p.Subjetiva_j_oi)
  ) {
    out += `Subjetiva<br>Cerca:&nbsp; OD: Esf: ${esc(p.Subjetiva_cerca_esf_od)} Cil: ${esc(p.Subjetiva_cerca_cil_od)} Eje: ${esc(p.Subjetiva_cerca_eje_od)} J: ${esc(p.Subjetiva_j_od)}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OI: Esf: ${esc(p.Subjetiva_cerca_esf_oi)} Cil: ${esc(p.Subjetiva_cerca_cil_oi)} Eje: ${esc(p.Subjetiva_cerca_eje_oi)} J: ${esc(p.Subjetiva_j_oi)}<br>`
    recetaPrint = true
  }
  // Nota: se omite el botón "Imprimir Receta" (acción, no dato).
  void recetaPrint

  if (ne(p.Dilatado)) out += `Cicloplegia: ${esc(p.Dilatado)}<br>`
  if (ne(p.Prueba_de_test_rv)) out += `Test de RV: ${esc(p.Prueba_de_test_rv)}<br>`

  if (
    ne(p.Rec_lejos_esf_od) ||
    ne(p.Rec_lejos_cil_od) ||
    ne(p.Rec_lejos_eje_od) ||
    ne(p.Rec_agudeza_od) ||
    ne(p.Rec_lejos_esf_oi) ||
    ne(p.Rec_lejos_cil_oi) ||
    ne(p.Rec_lejos_eje_oi) ||
    ne(p.Rec_agudeza_oi)
  ) {
    out += `Receta Anteojos:<br>Lejos:&nbsp; OD: Esf:${esc(p.Rec_lejos_esf_od)} Cil: ${esc(p.Rec_lejos_cil_od)} Eje: ${esc(p.Rec_lejos_eje_od)} AV: ${esc(p.Rec_agudeza_od)}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OI: Esf:${esc(p.Rec_lejos_esf_oi)} Cil: ${esc(p.Rec_lejos_cil_oi)} Eje: ${esc(p.Rec_lejos_eje_oi)} AV: ${esc(p.Rec_agudeza_oi)}<br>`
  }
  if (
    ne(p.Rec_cerca_esf_od) ||
    ne(p.Rec_cerca_cil_od) ||
    ne(p.Rec_cerca_eje_od) ||
    ne(p.Rec_j_od) ||
    ne(p.Rec_cerca_esf_oi) ||
    ne(p.Rec_cerca_cil_oi) ||
    ne(p.Rec_cerca_eje_oi) ||
    ne(p.Rec_j_oi)
  ) {
    out += `cerca:&nbsp; OD: Esf:${esc(p.Rec_cerca_esf_od)} Cil: ${esc(p.Rec_cerca_cil_od)} Eje: ${esc(p.Rec_cerca_eje_od)} J: ${esc(p.Rec_j_od)}<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OI: Esf:${esc(p.Rec_cerca_esf_oi)} Cil: ${esc(p.Rec_cerca_cil_oi)} Eje: ${esc(p.Rec_cerca_eje_oi)} J: ${esc(p.Rec_j_oi)}<br>`
  }
  if (ne(p.Rec_observ)) out += `Observacion de Receta: ${esc(p.Rec_observ)}<br>`

  if (ne(p.Estenopeico_agu_od) || ne(p.Estenopeico_agu_oi)) {
    out += `Con Estenopeicos:<br>OD: AV: ${esc(p.Estenopeico_agu_od)}&nbsp; OI: AV: ${esc(p.Estenopeico_agu_oi)}<br>`
  }

  if (ne(p.DP_cerca) || ne(p.DP_lejos)) {
    out += `D.Ip: Cerca: ${esc(p.DP_cerca)} mm, Lejos: ${esc(p.DP_lejos)} mm<br>`
  }

  if (
    ne(p.Dilatado_lejos_esf_od) ||
    ne(p.Dilatado_lejos_cil_od) ||
    ne(p.Dilatado_lejos_eje_od) ||
    ne(p.Dilatado_lejos_esf_oi) ||
    ne(p.Dilatado_lejos_cil_oi) ||
    ne(p.Dilatado_lejos_eje_oi)
  ) {
    out += `Autorefractometria Dilatado:<br>OD: Esf: ${esc(p.Dilatado_lejos_esf_od)} Cil: ${esc(p.Dilatado_lejos_cil_od)} Eje: ${esc(p.Dilatado_lejos_eje_od)}<br>
OI: Esf: ${esc(p.Dilatado_lejos_esf_oi)} Cil: ${esc(p.Dilatado_lejos_cil_oi)} Eje: ${esc(p.Dilatado_lejos_eje_oi)}<br>`
  }
  if (ne(p.Dilatado_se_od) || ne(p.Dilatado_se_oi)) {
    out += `SE: OD: ${esc(p.Dilatado_se_od)} OI: ${esc(p.Dilatado_se_oi)}<br>`
  }
  if (
    ne(p.Objetiva_esf_od) ||
    ne(p.Objetiva_cil_od) ||
    ne(p.Objetiva_eje_od) ||
    ne(p.Objetiva_esf_oi) ||
    ne(p.Objetiva_cil_oi) ||
    ne(p.Objetiva_eje_oi)
  ) {
    out += `Autorefractometria Sin Dilatar:<br>OD: Esf: ${esc(p.Objetiva_esf_od)} Cil: ${esc(p.Objetiva_cil_od)} Eje: ${esc(p.Objetiva_eje_od)}<br>
OI: Esf: ${esc(p.Objetiva_esf_oi)} Cil: ${esc(p.Objetiva_cil_oi)} Eje: ${esc(p.Objetiva_eje_oi)}<br>`
  }

  if (
    ne(p.Rec_lc_k1_od) ||
    ne(p.Rec_lc_k1_oi) ||
    ne(p.Rec_lc_k2_od) ||
    ne(p.Rec_lc_k2_oi) ||
    ne(p.Rec_lc_gr_od) ||
    ne(p.Rec_lc_gr_oi) ||
    ne(p.Rec_lc_po_od) ||
    ne(p.Rec_lc_po_oi) ||
    ne(p.Rec_lc_di_od) ||
    ne(p.Rec_lc_di_oi) ||
    ne(p.Rec_lc_agudeza_od) ||
    ne(p.Rec_lc_agudeza_oi)
  ) {
    out += `Receta de Keratometría:<br>`
  }
  if (ne(p.Rec_lc_k1_od) || ne(p.Rec_lc_k1_oi)) out += `K1: OD: ${esc(p.Rec_lc_k1_od)} OI: ${esc(p.Rec_lc_k1_oi)}<br>`
  if (ne(p.Rec_lc_k2_od) || ne(p.Rec_lc_k2_oi)) out += `K2: OD: ${esc(p.Rec_lc_k2_od)} OI: ${esc(p.Rec_lc_k2_oi)}<br>`
  if (ne(p.Rec_lc_gr_od) || ne(p.Rec_lc_gr_oi)) out += `GR: OD: ${esc(p.Rec_lc_gr_od)} OI: ${esc(p.Rec_lc_gr_oi)}<br>`
  if (ne(p.Rec_lc_po_od) || ne(p.Rec_lc_po_oi)) out += `PO: OD: ${esc(p.Rec_lc_po_od)} OI: ${esc(p.Rec_lc_po_oi)}<br>`
  if (ne(p.Rec_lc_di_od) || ne(p.Rec_lc_di_oi)) out += `DI: OD: ${esc(p.Rec_lc_di_od)} OI: ${esc(p.Rec_lc_di_oi)}<br>`
  if (ne(p.Rec_lc_agudeza_od) || ne(p.Rec_lc_agudeza_oi)) {
    out += `AV: OD: ${esc(p.Rec_lc_agudeza_od)} OI: ${esc(p.Rec_lc_agudeza_oi)}<br>`
  }

  if (
    ne(p.MAVD_esf_od) ||
    ne(p.MAVD_cil_od) ||
    ne(p.MAVD_eje_od) ||
    ne(p.MAVD_agudeza_od) ||
    ne(p.MAVD_esf_oi) ||
    ne(p.MAVD_cil_oi) ||
    ne(p.MAVD_eje_oi) ||
    ne(p.MAVD_agudeza_oi)
  ) {
    out += `Mejor Agudeza Visual Dilatado:<br>OD: Esf: ${esc(p.MAVD_esf_od)} Cil: ${esc(p.MAVD_cil_od)} Eje: ${esc(p.MAVD_eje_od)} AV: ${esc(p.MAVD_agudeza_od)}<br>
OI: Esf: ${esc(p.MAVD_esf_oi)} Cil: ${esc(p.MAVD_cil_oi)} Eje: ${esc(p.MAVD_eje_oi)} AV: ${esc(p.MAVD_agudeza_oi)}<br>`
  }

  if (ne(p.Observaciones)) {
    out += `Notas:&nbsp; ${nl2br(p.Observaciones)}<br>`
  }

  return out
}

// ---------------------------------------------------------------------
// frmt_ret.php (Retina) -- BUG LEGACY: el chequeo "Dilatado" evalúa
// Ret_Dilatado_Od dos veces (nunca revisa Ret_Dilatado_Oi para decidir el
// texto "Sí/No" de OI) -- se preserva tal cual.
// ---------------------------------------------------------------------
function frmtRet(p: P): string {
  let out = 'Retina:<br>'
  const dilatadoOd = Number(p.Ret_Dilatado_Od) > 0
  // BUG LEGACY: el original compara Ret_Dilatado_Od (no _Oi) para ambos.
  const dilatadoOi = Number(p.Ret_Dilatado_Od) > 0
  if (Number(p.Ret_Dilatado_Od) > 0 || Number(p.Ret_Dilatado_Oi) > 0) {
    out += `Dilatado: OD: ${dilatadoOd ? 'Sí' : 'No'} - OI: ${dilatadoOi ? 'Sí' : 'No'}<br>`
  }
  if (ne(p.Ret_EH_Od) || ne(p.Ret_EV_Od) || ne(p.Ret_EH_Oi) || ne(p.Ret_EV_Oi)) {
    out += `Equiascopia OD: Horizontal: ${esc(p.Ret_EH_Od)} - Vertical: ${esc(p.Ret_EV_Od)}<br>Equiascopia OI: Horizontal: ${esc(p.Ret_EH_Oi)} - Vertical: ${esc(p.Ret_EV_Oi)}<br>`
  }
  if (ne(p.Ret_Cruces_Od) || ne(p.Ret_Cruces_Oi)) {
    out += `Cruces OD: ${esc(p.Ret_Cruces_Od)} - OI: ${esc(p.Ret_Cruces_Oi)}<br>`
  }
  if (ne(p.Ret_Arterias_Od) || ne(p.Ret_Arterias_Oi)) {
    out += `Arterias OD: ${esc(p.Ret_Arterias_Od)} - OI: ${esc(p.Ret_Arterias_Oi)}<br>`
  }
  if (ne(p.Ret_Venas_Od) || ne(p.Ret_Venas_Oi)) {
    out += `Venas OD: ${esc(p.Ret_Venas_Od)} - OI: ${esc(p.Ret_Venas_Oi)}<br>`
  }
  if (ne(p.Ret_Periferia_Od) || ne(p.Ret_Periferia_Oi)) {
    out += `Periferia OD: ${esc(p.Ret_Periferia_Od)} - OI: ${esc(p.Ret_Periferia_Oi)}<br>`
  }
  if (ne(p.Ret_Dibujo_Od) || ne(p.Ret_Dibujo_Oi)) {
    out += `Dibujo OD: ${esc(p.Ret_Dibujo_Od)} - OI: ${esc(p.Ret_Dibujo_Oi)}<br>`
  }
  if (ne(p.Ret_Rfg_Od) || ne(p.Ret_Rfg_Oi)) {
    out += `RFG OD: ${esc(p.Ret_Rfg_Od)} - OI: ${esc(p.Ret_Rfg_Oi)}<br>`
  }
  if (ne(p.Ret_Amsler_Od) || ne(p.Ret_Amsler_Oi)) {
    out += `Test Amsler OD: ${esc(p.Ret_Amsler_Od)} - OI: ${esc(p.Ret_Amsler_Oi)}<br>`
  }
  if (ne(p.observ)) out += esc(p.observ)
  return out
}

// ---------------------------------------------------------------------
// frmt_autorefraccion.php (krm) -- se omite el link "ELIMINAR" (acción).
// ---------------------------------------------------------------------
function frmtAutorefraccion(p: P): string {
  const rhd = p.rhd,
    rhmm = p.rhmm,
    rha = p.rha,
    rvd = p.rvd,
    rvmm = p.rvmm,
    rva = p.rva,
    raved = p.raved,
    ravemm = p.ravemm
  const lhd = p.lhd,
    lhmm = p.lhmm,
    lha = p.lha,
    lvd = p.lvd,
    lvmm = p.lvmm,
    lva = p.lva,
    laved = p.laved,
    lavemm = p.lavemm

  let out = `<p>Auto-refracción:&nbsp;&nbsp;<b>VD:&nbsp;</b>${esc(p.vd)}<b>&nbsp;&nbsp;PD:&nbsp;</b>${esc(p.pd)}</p>
<table>
  <tr><th>&nbsp;</th><th>S</th><th>C</th><th>A</th><th>SE</th></tr>
  <tr><td><strong>OD</strong></td><td>${esc(p.rs)}</td><td>${esc(p.rc)}</td><td>${esc(p.ra)}</td><td>${esc(p.rse)}</td></tr>
  <tr><td><strong>OI</strong></td><td>${esc(p.ls)}</td><td>${esc(p.lc)}</td><td>${esc(p.la)}</td><td>${esc(p.lse)}</td></tr>
</table><br>`

  if (ne(rhd) && ne(rhmm) && ne(rha) && ne(rvd) && ne(rvmm) && ne(rva) && ne(raved) && ne(ravemm)) {
    out += `<table style="margin:0 auto">
  <tr><td rowspan="4">OD</td><td>&nbsp;</td><td>D</td><td>MM</td><td>A</td><td>CYL</td></tr>
  <tr><td>H</td><td>${esc(rhd)}</td><td>${esc(rhmm)}</td><td>${esc(rha)}</td><td rowspan="3">${esc(p.rcyl)}</td></tr>
  <tr><td>V</td><td>${esc(rvd)}</td><td>${esc(rvmm)}</td><td>${esc(rva)}</td></tr>
  <tr><td>AVE</td><td>${esc(raved)}</td><td>${esc(ravemm)}</td><td></td></tr>
</table><br>`
  }
  if (ne(lhd) && ne(lhmm) && ne(lha) && ne(lvd) && ne(lvmm) && ne(lva) && ne(laved) && ne(lavemm)) {
    out += `<table style="margin:0 auto">
  <tr><td rowspan="4">OI</td><td>&nbsp;</td><td>D</td><td>MM</td><td>A</td><td>CYL</td></tr>
  <tr><td>H</td><td>${esc(lhd)}</td><td>${esc(lhmm)}</td><td>${esc(lha)}</td><td rowspan="3">${esc(p.lcyl)}</td></tr>
  <tr><td>V</td><td>${esc(lvd)}</td><td>${esc(lvmm)}</td><td>${esc(lva)}</td></tr>
  <tr><td>AVE</td><td>${esc(laved)}</td><td>${esc(lavemm)}</td><td></td></tr>
</table>`
  }
  return out
}

/**
 * Arma el HTML de detalle para un código de práctica dado. Devuelve null
 * si no hay nada para mostrar (mismo comportamiento que el legacy: si la
 * fila no existe, o el código no tiene formatter, no se renderiza nada).
 */
export function buildPracticaHtml(codigo: string, practicaRaw: Record<string, unknown> | null, tree: PracticaTreeCtx): string | null {
  if (!practicaRaw) return null
  const p = practicaRaw

  switch (codigo) {
    case 'mtv':
      return ne(p.Motivo) ? `Motivo de Consulta: ${nl2br(p.Motivo)}` : null

    case 'bmc':
      return `${esc(p.Tipo_Bmc)} en ${esc(p.Ojo_Intervenido)}: ${esc(p.Observaciones)}`

    case 'cam': {
      let out = `Camara Anterior: OD: ${esc(p.OD)} - OI: ${esc(p.OI)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'cir':
      return `Cirugia: ${esc(p.Relato)} <br>en ${esc(p.Ojo_Intervenido)} a las ${esc(tree.Hora)}<br>
Codigo: ${esc(p.Codigo_Cirugia)} - Nro. Protocolo: ${esc(p.Nro_Protocolo)}<br>
Equipo: ${esc(p.Staff_Medico)}<br>`

    case 'con': {
      let out = `Conjuntiva: OD:${esc(p.OD)} - OI: ${esc(p.OI)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'cor': {
      let out = `Cornea: OD: ${esc(p.OD)} - OI: ${esc(p.OI)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'cpo': {
      // BUG LEGACY: los chequeos de Campimetria_OD/OI y "Mancha Ciega" en
      // el original comparan Campimetria_OD dos veces (nunca Campimetria_OI
      // ni Mancha_Ciega_OD/OI para decidir mostrar el bloque), y el bloque
      // "Mancha Ciega" además ECHOEA los valores de Campimetria (no los de
      // Mancha_Ciega) -- se preserva tal cual, incluida esta doble
      // duplicación de contenido con "Campimetría".
      let out = ''
      if (ne(p.Perimetria_OD) || ne(p.Perimetria_OI)) {
        out += `Perimetría: OD: ${esc(p.Perimetria_OD)} OI: ${esc(p.Perimetria_OI)}<br>`
      }
      if (ne(p.Campimetria_OD) || ne(p.Campimetria_OD)) {
        out += `Campimetría: OD: ${esc(p.Campimetria_OD)} OI: ${esc(p.Campimetria_OI)}<br>`
      }
      if (ne(p.Mancha_Ciega_OD) || ne(p.Campimetria_OD)) {
        out += `Mancha Ciega: OD: ${esc(p.Campimetria_OD)} OI: ${esc(p.Campimetria_OI)}<br>`
      }
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'cri':
      return `Cristalino: ${esc(p.Observaciones)}<br>`

    case 'cvt': {
      let out = tablaGrilla3x3(p, 'Cover-test cerca:<br>')
      if (ne(p.Tilt_Derecho)) out += `Tilt Derecho = ${esc(p.Tilt_Derecho)}<br>`
      if (ne(p.Tilt_Izquierdo)) out += `Tilt Izquierdo = ${esc(p.Tilt_Izquierdo)}<br>`
      if (ne(p.Test_Cerca)) out += `Cover-Test Cerca = ${esc(p.Test_Cerca)}<br>`
      return out || null
    }

    case 'dia': {
      let out = `Diagnostico: ${esc(p.Ojo)} ${esc(p.Codigo)} ${esc(p.Descripcion)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'drv': {
      // BUG LEGACY: "Derivo a:" se hace echo dos veces cuando
      // Tipo_Derivacion=='a' (una vez incondicional, otra dentro del if).
      // Y si Tipo_Derivacion NO es 'a', solo queda el "Derivo a:" suelto,
      // sin destinatario (el original no contempla otros valores).
      let out = 'Derivo a:'
      if (s(p.Tipo_Derivacion) === 'a') {
        out += 'Derivo a:&nbsp;'
        out += `${esc(p.Profesional_Deriva_Nombre)}&nbsp;`
        if (ne(p.Practica_Id)) {
          out += ` - practica: ${esc(p.Practica_Nombre)}<br>`
        } else {
          out += '<br>'
        }
        if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      }
      return out
    }

    case 'dst': {
      let out = `Datos Estadisticos: ${esc(p.Ojo)} ${esc(p.Codigo)} ${esc(p.Descripcion)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'eco':
      return `Ecometria: OD: ${esc(p.OD)} - OI: ${esc(p.OI)}<br>`

    case 'epo': {
      // BUG LEGACY: el chequeo usa $practica['Protocolo'] (mayúscula) pero
      // el echo usa $practica[protocolo] (minúscula) -- claves distintas,
      // así que el valor mostrado siempre queda vacío aunque el chequeo
      // pase. Se preserva: el rótulo aparece, el valor nunca.
      let out = ''
      if (ne(p.Protocolo)) out += `Examen Post Operatorio: <br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out || null
    }

    case 'epr': {
      let out = ''
      if (ne(p.Protocolo)) out += `Examen Pre Operatorio: ${esc(p.Protocolo)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out || null
    }

    case 'esc': {
      let out = `Esclera: OD: ${esc(p.OD)}- OI: ${esc(p.OI)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'eso': {
      // Nota: sin fila en tree_practicas actualmente -- inalcanzable
      // también en el legacy. Se implementa igual, por completitud.
      const fe = s(p.Fecha_Estudio).split('-')
      const fechaEstudio = fe.length === 3 ? `${fe[2]}-${fe[1]}-${fe[0]}` : s(p.Fecha_Estudio)
      let out = `Proxima Visita: ${esc(p.Practica_Nombre)} para la fecha ${esc(fechaEstudio)} en ${esc(p.Ojo)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'exo':
      return frmtExo(p) || null

    case 'iri': {
      // BUG LEGACY: se chequea 'Observacines' pero se echoea
      // 'Observacinoes' -- dos typos distintos, la clave nunca coincide,
      // por lo que esa línea nunca muestra nada en la práctica.
      let out = `Iris: OD: ${esc(p.OD)} - OI: ${esc(p.OI)}<br>`
      if (ne(p.Observacines)) {
        out += `${esc(p.Observacinoes)}<br>`
      }
      return out
    }

    case 'oba':
      return nl2br(`Observación: ${s(p.Observaciones)}`)

    case 'obi':
      return `${esc(p.Tipo_Obi)} en ${esc(p.Ojo_Intervenido)}: ${esc(p.Observaciones)}<br>`

    case 'obs':
      return ne(p.Observaciones) ? nl2br(p.Observaciones) : null

    case 'pap': {
      let out = ''
      if (ne(p.OD) || ne(p.OI)) out += `Papilas: OD: ${esc(p.OD)} OI: ${esc(p.OI)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out || null
    }

    case 'paq':
      return tablaGrilla3x3(p, `Paquimetria:&nbsp;${esc(p.Ojo)}<br>`) || null

    case 'par': {
      let out = ''
      if (ne(p.OD) || ne(p.OI)) out += `Parpados: OD: ${esc(p.OD)} OI: ${esc(p.OI)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out || null
    }

    case 'pio':
    case 'poc': {
      let out = ''
      const tonometro = ne(p.Tonometro) ? `Tonometro: ${esc(p.Tonometro)}` : ''
      const np = s(p.Nada_Patologico) === '1' ? 'Nada Patológico' : ''
      if (ne(p.OD) || ne(p.OI)) {
        const horaToma = s(p.Hora_de_Toma) === '00:00:00' ? '' : `, Tomada a las ${esc(p.Hora_de_Toma)}`
        out += `PIO: OD: ${esc(p.OD)} - OI: ${esc(p.OI)} ${horaToma} ${np} ${tonometro}<br>`
      }
      if (ne(p.paq_od) || ne(p.paq_oi)) {
        out += `PIO Valor Corregido: OD: ${esc(p.vc_od)} - OI: ${esc(p.vc_oi)}<br>
Paquimetria OD: ${esc(p.paq_od)}<br>
Paquimetria OI: ${esc(p.paq_oi)}<br>`
      }
      return out || null
    }

    case 'prv': {
      const fv = s(p.Fecha_Visita).split('-')
      const fechaVisita = fv.length === 3 ? `${fv[2]}-${fv[1]}-${fv[0]}` : s(p.Fecha_Visita)
      let out = `Proxima Visita: ${esc(fechaVisita)}<br>`
      if (ne(p.Examen_a_Realizar)) out += `Se Solicita Estudio: ${esc(p.Examen_a_Realizar)}<br>`
      if (ne(p.Derivacion)) out += `Derivado a: ${esc(p.Derivacion)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'pup': {
      let out = `Pupila: OD: ${esc(p.OD)} - OI: ${esc(p.OI)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'rec': {
      let medic1 = ''
      let medic2 = ''
      if (ne(p.Presentacion1) && ne(p.Cantidad1)) {
        medic1 = `Medicacion: ${esc(p.Presentacion1)} - Cantidad: ${esc(p.Cantidad1)} - Indicaciones: ${esc(p.Indicaciones)}<br>`
      }
      if (ne(p.Presentacion2) && ne(p.Cantidad2)) {
        medic2 = `Medicacion: ${esc(p.Presentacion2)} - Cantidad: ${esc(p.Cantidad2)} - Indicaciones: ${esc(p.Indicaciones_2)}<br>`
      }
      const icd10 = nl2br(p.Diagnostico_Codigo_ICD10)
      const diagnostico = nl2br(p.Diagnostico)
      // BUG LEGACY: al `case "rec":` de formato_practicas.php le falta el
      // `break;` -- cae directo en `case "ref":` y también se ejecuta
      // frmt_ref.php sobre la fila de `tree_recetas` (que no tiene los
      // campos de refracción). En la práctica esto no muestra texto
      // (todos los campos de refracción quedan vacíos) salvo por una
      // línea "<br>" residual que sí queda huérfana -- se preserva acá.
      return `${medic1}${medic2}${icd10}<br>${diagnostico}<br>`
    }

    case 'ref':
      return frmtRef(p) || null

    case 'ret':
      return frmtRet(p)

    case 'vit': {
      let out = `Vitreo: OD: ${esc(p.OD)} - OI: ${esc(p.OI)}<br>`
      if (ne(p.Observaciones)) out += `${esc(p.Observaciones)}<br>`
      return out
    }

    case 'krm':
      // Nota: sin fila en tree_practicas actualmente -- inalcanzable
      // también en el legacy. Se implementa igual, por completitud.
      return frmtAutorefraccion(p)

    case 'exp':
      return nl2br(`Explico: ${s(p.Observaciones)}`)

    default:
      return null
  }
}

export function PracticaDetalleHtml({
  codigo,
  practica,
  tree,
}: {
  codigo: string
  practica: Record<string, unknown> | null
  tree: PracticaTreeCtx
}) {
  const html = buildPracticaHtml(codigo, practica, tree)
  if (!html) {
    return <p className="text-xs italic text-muted-foreground">Sin detalle disponible.</p>
  }
  return <div className="text-sm leading-relaxed text-foreground [&_table]:my-1" dangerouslySetInnerHTML={{ __html: html }} />
}
