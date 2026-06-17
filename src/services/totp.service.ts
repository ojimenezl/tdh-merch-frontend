/**
 * Servicio de autenticación de dos factores (TOTP/Google Authenticator)
 * 
 * NOTA: Este es un mock. En producción:
 * 1. Instalar `otplib` en el backend: npm install otplib
 * 2. Cada usuario admin/superadmin tendrá un `totpSecret` en la BD
 * 3. Al activar 2FA, generar QR code con: otplib.authenticator.keyuri(email, 'TDH merch', secret)
 * 4. Verificar con: otplib.authenticator.verify({ token, secret })
 * 
 * Ejemplo de implementación en backend:
 * ```typescript
 * import { authenticator } from 'otplib';
 * 
 * // Generar secret para nuevo usuario
 * const secret = authenticator.generateSecret();
 * 
 * // Generar URL para QR code
 * const otpauth = authenticator.keyuri(user.email, 'TDH merch', secret);
 * 
 * // Verificar código
 * const isValid = authenticator.verify({ token: userCode, secret: user.totpSecret });
 * ```
 */

import { simularLatencia } from './config'

export interface VerificacionTOTP {
  valido: boolean
  mensaje?: string
}

/**
 * Verifica el código TOTP del usuario
 * @param userId ID del usuario
 * @param codigo Código de 6 dígitos del authenticator
 * @returns Promise con resultado de verificación
 */
export async function verificarCodigoTOTP(userId: string, codigo: string): Promise<VerificacionTOTP> {
  await simularLatencia(null, 500)

  // Validar formato: debe ser 6 dígitos
  if (!/^\d{6}$/.test(codigo)) {
    return { valido: false, mensaje: 'El código debe ser de 6 dígitos' }
  }

  // MOCK: Acepta cualquier código de 6 dígitos
  // En producción, aquí se llamaría al backend para verificar con otplib
  // 
  // Ejemplo de llamada real:
  // return apiFetch<VerificacionTOTP>('/auth/verify-totp', {
  //   method: 'POST',
  //   body: JSON.stringify({ userId, codigo })
  // })

  console.log(`[MOCK TOTP] Usuario ${userId} verificó código: ${codigo}`)
  
  return { valido: true }
}

/**
 * Verifica si un usuario tiene 2FA activado
 * @param userId ID del usuario
 * @returns true si el usuario requiere 2FA
 */
export async function requiere2FA(_userId: string, rol: string): Promise<boolean> {
  await simularLatencia(null, 100)
  
  // Solo admin y superadmin requieren 2FA
  // En producción, verificar si el usuario tiene 2FA habilitado en la BD
  return rol === 'admin' || rol === 'superadmin'
}

export const totpService = {
  verificarCodigo: verificarCodigoTOTP,
  requiere2FA,
}
