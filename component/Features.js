import React from 'react'

const Features = () => {
  return (
    <div className="bg-white text-black">

      {/* FEATURES */}
      <section className="grid grid-cols-2 md:grid-cols-4 text-center border-t border-b py-6">
        <div>
          🚚
          <p className="font-semibold">FAST DELIVERY</p>
          <p className="text-sm text-gray-500">All Over Pakistan</p>
        </div>

        <div>
          💵
          <p className="font-semibold">CASH ON DELIVERY</p>
          <p className="text-sm text-gray-500">Safe Payment</p>
        </div>

        <div>
          🔄
          <p className="font-semibold">EASY RETURNS</p>
          <p className="text-sm text-gray-500">7 Days Policy</p>
        </div>

        <div>
          ✔️
          <p className="font-semibold">PREMIUM QUALITY</p>
          <p className="text-sm text-gray-500">Original Products</p>
        </div>
      </section>


    </div>
  )
}

export default Features