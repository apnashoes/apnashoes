export default function OrderTimeline({ order }) {
  const steps = ["pending", "confirmed", "shipped", "delivered"];

  const getStepIndex = (status) => steps.indexOf(status);
  const currentStep = getStepIndex(order.status);

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-4">Order Tracking</h3>

      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 text-center relative">
            
            {/* Line */}
            {index !== steps.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-1 
                ${index < currentStep ? "bg-green-500" : "bg-gray-300"}`}
              />
            )}

            {/* Circle */}
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white
              ${index <= currentStep ? "bg-green-500" : "bg-gray-300"}`}
            >
              {index <= currentStep ? "✓" : ""}
            </div>

            {/* Label */}
            <p className="text-sm mt-2 capitalize">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}