import img1 from '@/assets/img-carrusel/1.jpg'
import img2 from '@/assets/img-carrusel/2.jpg'
import img3 from '@/assets/img-carrusel/3.jpg'
import img4 from '@/assets/img-carrusel/4.jpg'
import img5 from '@/assets/img-carrusel/5.jpg'
import img6 from '@/assets/img-carrusel/6.jpg'
import img7 from '@/assets/img-carrusel/7.jpg'

export interface CarouselSlide {
  id: string
  titulo: string
  imagen: string
  destacado?: boolean
}

export const HOME_CAROUSEL_SLIDES: CarouselSlide[] = [
  { id: 's1', titulo: 'calle un rato', imagen: img1 },
  { id: 's2', titulo: 'avisparasee', imagen: img2 },
  { id: 's3', titulo: 'thd 593', imagen: img3 },
  { id: 's4', titulo: 'made Ecuador', imagen: img4, destacado: true },
  { id: 's5', titulo: 'deje hablar', imagen: img5 },
  { id: 's6', titulo: 'oooozzz', imagen: img6 },
  { id: 's7', titulo: 'issssaaccc', imagen: img7 },
]

export const HOME_CAROUSEL_INITIAL = HOME_CAROUSEL_SLIDES.findIndex((s) => s.destacado)
