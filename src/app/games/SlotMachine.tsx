'use client'

import { useState } from 'react'
import { Cherry, Grape, Citrus, DollarSign, Sparkles, ArrowLeft, X, RefreshCw, Play } from 'lucide-react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'

import { ConfettiComponent } from '@/app/components/Confetti'
import { useAuth } from '@/app/contexts/AuthContext'
import { LocalStorage } from '@/app/lib/storage'
import { formatMoney } from '@/app/utils/maskUtils'

type ModalInfo = {
  type: 'win' | 'loss'
  title: string
  message: string
  amount?: number
} | null

const SYMBOLS = [
  { id: 'cherry', icon: Cherry, color: 'text-red-500', weight: 40 },
  { id: 'lemon', icon: Citrus, color: 'text-yellow-400', weight: 30 },
  { id: 'grape', icon: Grape, color: 'text-purple-500', weight: 20 },
  { id: 'dollar', icon: DollarSign, color: 'text-green-400', weight: 10 },
]
const PAYOUTS = { cherry: 2, lemon: 3, grape: 5, dollar: 10 }

const ResultModal = ({ info, onClose }: { info: ModalInfo; onClose: () => void }) => {
  if (!info) return null

  const icons = {
    win: <CheckCircleIcon className='w-12 h-12 sm:w-16 sm:h-16 text-emerald-400' />,
    loss: <XCircleIcon className='w-12 h-12 sm:w-16 sm:h-16 text-red-500' />,
  }
  const borderColors = {
    win: 'border-emerald-500',
    loss: 'border-red-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        className={`bg-slate-800 rounded-2xl border-2 ${borderColors[info.type]} shadow-2xl p-6 sm:p-8 w-full max-w-md text-center relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className='cursor-pointer absolute top-3 right-3 text-slate-400 hover:text-white transition-colors'><X size={24} /></button>
        <div className='flex justify-center mb-4'>{icons[info.type]}</div>
        <h2 className='text-2xl sm:text-3xl font-bold text-white mb-2'>{info.title}</h2>
        {info.amount && info.amount > 0 && (
          <p className='text-3xl sm:text-4xl font-bold text-emerald-400 my-4'>
            +{formatMoney(info.amount)}
          </p>
        )}
        <p className='text-slate-300 text-base sm:text-lg'>{info.message}</p>
      </motion.div>
    </motion.div>
  )
}

const ConfirmationModal = ({ count, betAmount, total, onConfirm, onCancel }: { count: number, betAmount: number, total: number, onConfirm: () => void, onCancel: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        className='bg-slate-800 rounded-2xl border-2 border-amber-500 shadow-2xl p-6 sm:p-8 w-full max-w-md text-center relative'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='text-xl sm:text-2xl font-bold text-white mb-4'>Confirmar Auto-Giro</h2>
        <p className='text-slate-300 text-base sm:text-lg mb-6'>
            Você irá rodar <span className="text-white font-bold">{count}</span> vezes de <span className="text-white font-bold">{formatMoney(betAmount)}</span>.
            <br/>
            Total: <span className="text-amber-400 font-bold">{formatMoney(total)}</span>
        </p>
        <div className="flex gap-4 justify-center">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors cursor-pointer text-sm sm:text-base">Cancelar</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold transition-colors cursor-pointer text-sm sm:text-base">Confirmar</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const Reel = ({ finalSymbolId, isSpinning }: { finalSymbolId: string; isSpinning: boolean }) => {
    return (
        <div className='h-24 sm:h-32 overflow-hidden bg-slate-900/80 rounded-xl flex items-center justify-center relative border-2 border-slate-700 shadow-inner bg-gradient-to-b from-slate-900 to-slate-800 sm:rounded-2xl border-2 sm:border-4 border-yellow-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.2),0_0_25px_rgba(255,215,0,0.5)] flex justify-center'>
            <motion.div
                animate={{ y: isSpinning ? ['0%', `-${SYMBOLS.length * 15}%`] : '0%' }}
                transition={isSpinning ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : { duration: 0.5, ease: [0.25, 1, 0.5, 1] }} 
            >
                {[...SYMBOLS, ...SYMBOLS].map((s, index) => {
                    const Icon = s.icon
                    return <div key={`${s.id}-${index}`} className='h-24 sm:h-32 flex items-center justify-center'>
                        <Icon className={`w-12 h-12 sm:w-16 sm:h-16 ${s.color}`} strokeWidth={2.5} />
                    </div>
                })}
            </motion.div>

            <AnimatePresence>
                {!isSpinning && finalSymbolId && (
                     <motion.div
                        key={finalSymbolId}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className='absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-xl backdrop-blur-sm' 
                     >
                        {(() => {
                            const symbol = SYMBOLS.find(s => s.id === finalSymbolId);
                            if (!symbol) return null;
                            const Icon = symbol.icon
                            return <Icon className={`w-14 h-14 sm:w-20 sm:h-20 ${symbol.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]`} strokeWidth={2.5} />
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const Paytable = () => {
    return (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 px-2">
            {SYMBOLS.map((symbol) => {
                const multiplier = PAYOUTS[symbol.id as keyof typeof PAYOUTS]
                return (
                    <div key={symbol.id} className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-600/50 shadow-sm" title={`Combinação de 3 ${symbol.id} paga ${multiplier}x`}>
                        <symbol.icon className={`w-5 h-5 ${symbol.color}`} />
                        <span className="text-slate-200 font-bold text-sm">
                            {multiplier}x
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export const SlotMachine = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshProfile } = useAuth()
  const [reels, setReels] = useState(['cherry', 'lemon', 'grape'])
  const [spinning, setSpinning] = useState(false)
  const [betAmount, setBetAmount] = useState<number | string>(10) 
  const [modalInfo, setModalInfo] = useState<ModalInfo>(null)
  const [endGameInfo, setEndGameInfo] = useState<ModalInfo>(null) 
  const [showConfetti, setShowConfetti] = useState(false)
  const [canPlayAgain, setCanPlayAgain] = useState(false)
  
  // Auto Spin States
  const [autoSpinCount, setAutoSpinCount] = useState<number | string>('')
  const [isAutoSpinning, setIsAutoSpinning] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)

  const handleBetAmountChange = (value: number | string) => {
    if (value === '') {
      setBetAmount('')
      return
    }
    const numValue = Number(value)
    if (profile && !isNaN(numValue)) {
      const clampedValue = Math.max(1, Math.min(numValue, profile.balance));
      setBetAmount(clampedValue)
    }
  }

  const handleBetBlur = () => {
    const numericValue = Number(betAmount)
    if (isNaN(numericValue) || numericValue < 1) {
      setBetAmount(1)
    }
  }

  const handleAutoSpinChange = (value: number | string) => {
     if (value === '') {
       setAutoSpinCount('')
       return
     }
     const numValue = Math.floor(Number(value))
     if (!isNaN(numValue) && numValue >= 0) {
        setAutoSpinCount(numValue)
     }
  }

  const getRandomSymbol = () => {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0)
    let random = Math.random() * totalWeight
    for (const symbol of SYMBOLS) {
      random -= symbol.weight
      if (random <= 0) return symbol.id
    }
    return SYMBOLS[0].id
  }

  const executeSpin = (deductCost: boolean) => {
    return new Promise<void>((resolve) => {
      if (!profile) {
        resolve()
        return
      }
      
      const currentProfile = LocalStorage.getProfile(profile.id)
      if (!currentProfile) {
          resolve()
          return
      }

      const numericBetAmount = Number(betAmount);

      if (deductCost && numericBetAmount > currentProfile.balance) {
         setModalInfo({ type: 'loss', title: 'Saldo Insuficiente!', message: `Você tentou apostar ${formatMoney(numericBetAmount)}, mas só tem ${formatMoney(currentProfile.balance)}.` })
         resolve()
         return
      }

      setSpinning(true)
      setModalInfo(null)
      setEndGameInfo(null)
      setShowConfetti(false)
      setCanPlayAgain(false)

      if (deductCost) {
          const newBalanceAfterBet = currentProfile.balance - numericBetAmount;
          LocalStorage.updateProfile(profile.id, {
            balance: newBalanceAfterBet,
            total_wagered: currentProfile.total_wagered + numericBetAmount,
          }).then(() => {
              refreshProfile();
          })
      }

      const spinDuration = 1500 + Math.random() * 1000

      setTimeout(() => {
        const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
        setReels(finalReels)
        setSpinning(false)

        setTimeout(async () => {
          const allSame = finalReels.every(symbol => symbol === finalReels[0])
          let payout = 0
          let modalData: ModalInfo = null

          if (allSame) {
            const multiplier = PAYOUTS[finalReels[0] as keyof typeof PAYOUTS]
            payout = numericBetAmount * multiplier
            modalData = {
              type: 'win',
              title: 'Você Ganhou!',
              amount: payout,
              message: `Combinação de ${finalReels[0]}! Pagamento de ${multiplier}x!`,
            }
            setShowConfetti(true)

            const updatedProfile = LocalStorage.getProfile(profile.id)
            if (updatedProfile) {
                await LocalStorage.updateProfile(profile.id, {
                    balance: updatedProfile.balance + payout,
                    total_won: updatedProfile.total_won + payout,
                })
            }
          } else {
            payout = 0
            modalData = {
              type: 'loss',
              title: 'Não foi dessa vez!',
              message: 'Sem combinação. Tente novamente!',
            }
          }

          setModalInfo(modalData)
          setEndGameInfo(modalData)

          const profileForHistory = LocalStorage.getProfile(profile.id)
          
          await LocalStorage.addGameHistory({
            user_id: profile.id,
            game_type: 'slots',
            bet_amount: numericBetAmount,
            payout_amount: payout,
            game_data: { reels: finalReels },
            balance_after: profileForHistory ? profileForHistory.balance : 0,
          })

          refreshProfile()
          resolve()
        }, 500)
      }, spinDuration)
    })
  }

  const startAutoSpin = async () => {
      setShowConfirmation(false)
      const autoCount = Number(autoSpinCount)
      const numericBetAmount = Number(betAmount)
      const totalCost = numericBetAmount * autoCount

      const currentProfile = LocalStorage.getProfile(profile!.id)
      if (currentProfile) {
         const newBalance = currentProfile.balance - totalCost
         await LocalStorage.updateProfile(profile!.id, {
             balance: newBalance,
             total_wagered: currentProfile.total_wagered + totalCost
         })
         refreshProfile()
      }

      setIsAutoSpinning(true)
      setCurrentRound(0)
      
      for (let i = 0; i < autoCount; i++) {
          setCurrentRound(i + 1)
          await executeSpin(false)
          if (i < autoCount - 1) {
              await new Promise(r => setTimeout(r, 1000))
          }
      }
      setIsAutoSpinning(false)
      setCurrentRound(0)
  }

  const handleSpinClick = async () => {
      if (isAutoSpinning || spinning) return

      const autoCount = Number(autoSpinCount)
      const numericBetAmount = Number(betAmount)

      if (autoCount === 0 && numericBetAmount > (profile?.balance || 0)) {
           setModalInfo({ type: 'loss', title: 'Saldo Insuficiente!', message: `Você precisa de ${formatMoney(numericBetAmount)}.` })
           return
      }

      if (autoCount > 0) {
          const totalCost = numericBetAmount * autoCount
          
          if (totalCost > (profile?.balance || 0)) {
             setModalInfo({ type: 'loss', title: 'Saldo Insuficiente!', message: `Para ${autoCount} rodadas automáticas, você precisa de ${formatMoney(totalCost)}.` })
             return
          }

          setShowConfirmation(true)
      } else {
          await executeSpin(true)
      }
  }

  const newGame = () => {
    setModalInfo(null)
    setEndGameInfo(null)
    setShowConfetti(false)
    setCanPlayAgain(false)
  }

  const handleModalClose = () => {
    setModalInfo(null)
    setShowConfetti(false)
    if (endGameInfo) {
      setCanPlayAgain(true)
    }
  }

  return (
    <main className='relative mx-auto max-w-2xl bg-gradient-to-b from-yellow-600 to-yellow-800 p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] border-4 sm:border-[6px] border-yellow-400 shadow-[0_0_40px_rgba(255,200,0,0.5)] mt-8 mb-8'>
      <AnimatePresence>
        {modalInfo && <ResultModal info={modalInfo} onClose={handleModalClose} />}
        {showConfirmation && (
            <ConfirmationModal 
                count={Number(autoSpinCount)} 
                betAmount={Number(betAmount)} 
                total={Number(autoSpinCount) * Number(betAmount)} 
                onConfirm={startAutoSpin} 
                onCancel={() => setShowConfirmation(false)} 
            />
        )}
      </AnimatePresence>

      <div className='max-w-3xl mx-auto'>
        <button
          onClick={onBack}
          className='mb-4 cursor-pointer px-3 py-2 sm:px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md text-sm sm:text-base'
        >
          <ArrowLeft size={20} /> Voltar ao Lobby
        </button>

        <div className='bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-4 sm:p-6 md:p-8 relative'>
          {showConfetti && <ConfettiComponent />}
          <div className='text-center mb-6'>
            <h1 className='text-3xl sm:text-4xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-3 tracking-wider'>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" /> Slot Machine
            </h1>
             <p className='text-slate-400 text-sm sm:text-base'>Combine 3 símbolos para ganhar!</p>
             <Paytable />
          </div>

          <div className='bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl p-4 sm:p-6 md:p-8 border-2 border-amber-500/30 shadow-lg relative'>
             {spinning && (
                 <motion.div
                    className="absolute inset-x-0 top-0 h-1 bg-amber-400 rounded-t-lg"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                 />
             )}
            <div className='grid grid-cols-3 gap-2 sm:gap-4'>
              <Reel finalSymbolId={reels[0]} isSpinning={spinning} />
              <Reel finalSymbolId={reels[1]} isSpinning={spinning} />
              <Reel finalSymbolId={reels[2]} isSpinning={spinning} />
            </div>
          </div>
          
          {/* Contêiner para mensagens (Resultado, Contador Auto, Placeholder) */}
          <div className="h-16 mt-6 mb-6 flex flex-col justify-center items-center">
            <AnimatePresence mode="wait">
              {isAutoSpinning && (
                <motion.div
                  key="counter"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-amber-400">
                    Rodada {currentRound} / {autoSpinCount}
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base">Girando...</p>
                </motion.div>
              )}

              {endGameInfo && !modalInfo && !isAutoSpinning && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <h3 className={`text-xl sm:text-2xl font-bold ${endGameInfo.type === 'win' ? 'text-emerald-400' : 'text-red-500'}`}>
                    {endGameInfo.title}
                  </h3>
                  {endGameInfo.amount && endGameInfo.amount > 0 && (
                    <p className='text-lg sm:text-xl font-semibold text-emerald-400'>
                      +{formatMoney(endGameInfo.amount)}
                    </p>
                  )}
                  {!endGameInfo.amount && endGameInfo.type === 'loss' && (
                    <p className="text-slate-300 text-sm sm:text-base">{endGameInfo.message}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className='space-y-6'>
             {endGameInfo && !modalInfo && !isAutoSpinning ? (
                 <div className='max-w-sm mx-auto'>
                    <button
                      onClick={newGame} disabled={!canPlayAgain}
                      className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-3 sm:py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-lg sm:text-xl uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer'
                    >
                      <RefreshCw size={24} />
                      Jogar Novamente
                    </button>
                 </div>
             ) : (
                 <>
                   <div className='max-w-sm mx-auto space-y-4'>
                     <div>
                        <label className='block text-slate-300 mb-2 text-center text-base sm:text-lg'>
                          {`Valor da Aposta: `}
                          <span className='font-bold text-amber-400 text-lg sm:text-xl'>
                            {formatMoney(Number(betAmount))}
                          </span>
                        </label>
                        <div className='flex items-center gap-2 sm:gap-4'>
                          <input
                            type='number'
                            value={betAmount}
                            onChange={(e) => handleBetAmountChange(e.target.value)}
                            onBlur={handleBetBlur}
                            disabled={spinning || isAutoSpinning}
                            min="1"
                            step="1" 
                            max={profile?.balance || 1} 
                            className='w-24 sm:w-32 bg-slate-900/70 border-2 border-slate-600 rounded-lg text-amber-400 text-center text-lg sm:text-xl font-bold py-2 px-2 focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none'
                            placeholder='1'
                          />
                          <input
                            type='range'
                            min='1'
                            max={Math.max(1, profile?.balance || 1)} 
                            value={Number(betAmount)}
                            onChange={(e) => handleBetAmountChange(e.target.value)}
                            disabled={spinning || isAutoSpinning}
                            className='w-full h-3 bg-slate-700 rounded-lg accent-amber-500 cursor-pointer'
                          />
                        </div>
                        <div className='flex flex-wrap justify-center gap-2 mt-3'>
                          <button onClick={() => handleBetAmountChange(Math.max(1, Math.floor(Number(betAmount) / 2)))} disabled={spinning || isAutoSpinning} className='px-2 py-1 sm:px-3 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>½</button>
                          <button onClick={() => handleBetAmountChange(Number(betAmount) * 2)} disabled={spinning || isAutoSpinning} className='px-2 py-1 sm:px-3 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>2x</button>
                          <button onClick={() => handleBetAmountChange(Number(betAmount) + 10)} disabled={spinning || isAutoSpinning} className='px-2 py-1 sm:px-3 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+10</button>
                          <button onClick={() => handleBetAmountChange(Number(betAmount) + 50)} disabled={spinning || isAutoSpinning} className='px-2 py-1 sm:px-3 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+50</button>
                          <button onClick={() => handleBetAmountChange(Number(betAmount) + 100)} disabled={spinning || isAutoSpinning} className='px-2 py-1 sm:px-3 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+100</button>
                          <button onClick={() => handleBetAmountChange(profile?.balance || 1)} disabled={spinning || isAutoSpinning} className='px-2 py-1 sm:px-3 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>Max</button>
                        </div>
                     </div>

                     <div className='pt-4 border-t border-slate-700'>
                        <label className='block text-slate-300 mb-2 text-center text-sm sm:text-base'>
                           Rodadas Automáticas (Opcional)
                        </label>
                        <div className='flex justify-center items-center gap-2 sm:gap-4'>
                           <input
                              type='number'
                              min='0'
                              max='100'
                              value={autoSpinCount}
                              onChange={(e) => handleAutoSpinChange(e.target.value)}
                              disabled={spinning || isAutoSpinning}
                              className='w-full bg-slate-900/70 border-2 border-slate-600 rounded-lg text-white text-center text-base sm:text-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none placeholder-slate-500'
                              placeholder='0'
                           />
                           <div className="flex gap-1 sm:gap-2">
                             <button onClick={() => handleAutoSpinChange(10)} disabled={spinning || isAutoSpinning} className="px-2 py-2 sm:px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs sm:text-sm font-bold text-white transition-colors">10</button>
                             <button onClick={() => handleAutoSpinChange(20)} disabled={spinning || isAutoSpinning} className="px-2 py-2 sm:px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs sm:text-sm font-bold text-white transition-colors">20</button>
                             <button onClick={() => handleAutoSpinChange(50)} disabled={spinning || isAutoSpinning} className="px-2 py-2 sm:px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs sm:text-sm font-bold text-white transition-colors">50</button>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div className='max-w-sm mx-auto mt-4'>
                      <button
                        onClick={handleSpinClick}
                        disabled={(spinning && !isAutoSpinning) || !profile || Number(betAmount) > (profile?.balance || 0) || Number(betAmount) < 1 || (isAutoSpinning && spinning)}
                        className={`w-full font-bold py-3 sm:py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg text-lg sm:text-xl uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2
                            ${isAutoSpinning 
                                ? 'bg-slate-600 text-slate-300 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 hover:shadow-amber-500/30'
                            }
                        `}
                      >
                        {isAutoSpinning ? (
                            <>
                                <RefreshCw size={24} className="animate-spin" />
                                Girando Auto...
                            </>
                        ) : (
                            <>
                                {Number(autoSpinCount) > 0 ? <Play size={24} fill="currentColor" /> : <Sparkles size={24}/>}
                                {Number(autoSpinCount) > 0 ? `Auto Girar (${autoSpinCount})` : (spinning ? 'GIRANDO...' : 'Girar')}
                            </>
                        )}
                      </button>
                   </div>
                 </>
             )}
          </div>
        </div>
      </div>
    </main>
  )
}