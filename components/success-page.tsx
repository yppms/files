"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CustomCard, CardContent } from "@/components/ui/custom-card"
import { CheckCircle2, ExternalLink, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function SuccessPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="container mx-auto max-w-3xl py-4 sm:py-6 md:py-10 px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* Success Message */}
        <CustomCard className="p-3 sm:p-4 md:p-8 border-primary-100 shadow-md overflow-hidden bg-gradient-to-br from-white to-primary-50">
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 md:space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-800"
            >
              Pemberkasan sukses!
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm sm:text-base md:text-lg text-slate-700 max-w-xl"
            >
              <p>
                Terima Kasih Ayah Bunda, data sudah kami terima. Selanjutnya tim pendaftaran akan menghubungi pada
                proses pengukuran seragam dan penyediaan peralatan. Perkiraan pada 1 Juli.
              </p>
            </motion.div>
          </div>
        </CustomCard>

        {/* Review Request */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <CustomCard>
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-3 sm:p-4 md:p-6 text-white rounded-t-lg">
              <div className="flex flex-col items-center text-center space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Bantu ulas TKIT Miftahussalam di Google!
                </h2>
                <p className="text-base font-bold">Agar Ananda semakin banyak teman belajar & bermain</p>
                <div className="text-xl sm:text-2xl">👳🏽👳🏽🧕🏽🧕🏽</div>
              </div>
            </div>

            <CardContent className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-5">
              <p className="text-slate-700 text-center">
                Apabila Ayah Bunda puas pada layanan pendaftaran TKIT Miftahussaalam, kami sangat senang apabila dapat
                memberikan rating bintang 5 dan sedikit ulasan di halaman Google kami. Silahkan klik tombol dibawah ini.
              </p>

              <div className="flex flex-col items-center space-y-3 sm:space-y-4 md:space-y-5 py-2 sm:py-3 md:py-4">
                {/* Button first */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full max-w-md mb-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <Link
                    href="https://search.google.com/local/writereview?placeid=ChIJU4vbYepYei4R3fsh1NFBEGI"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white gap-2 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-lg">
                      <ThumbsUp className="h-5 w-5" />
                      Beri Ulasan di Google
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>

                <p className="text-sm text-center text-slate-500 max-w-md mt-2">
                  Ulasan Ayah Bunda dapat membantu orang tua lain menemukan sekolah terbaik untuk buah hati mereka.
                </p>
              </div>
            </CardContent>
          </CustomCard>
        </motion.div>
      </motion.div>
    </div>
  )
}
