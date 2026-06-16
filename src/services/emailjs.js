import emailjs from 'emailjs-com'

const SERVICE_ID = 'service_npfx6ao'
const TEMPLATE_ID = 'template_b0qpxg6'
const PUBLIC_KEY = 'wAoQYIDdiygiVu5qM'

export const initializeEmailJS = () => {
  emailjs.init(PUBLIC_KEY)
}

export const sendOtpEmail = async (email, otp) => {
  try {
    const templateParams = {
      email: email,
      to_email: email,
      user_email: email,
      otp: otp,
      otp_code: otp,
      message: `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`,
    }

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
    console.log('OTP email sent successfully:', response)
    return response
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    console.error('Error details:', error.text)
    throw error
  }
}
