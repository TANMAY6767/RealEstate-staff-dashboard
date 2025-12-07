import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export function CarDetailsDialog({ open, onOpenChange, car }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Car Details - {car?.name}</DialogTitle>
          <DialogDescription>Detailed specifications of {car?.name}</DialogDescription>
        </DialogHeader>
        {car?.details && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold mb-3 text-primary">Car Specifications</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Year:</span> {car.details.year || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Engine Type:</span>{" "}
                  {car.details.engine_type || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Engine Size:</span>{" "}
                  {car.details.engine_size || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Transmission:</span>{" "}
                  {car.details.transmission || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Color:</span> {car.details.color || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Fuel:</span> {car.details.fuel || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-7">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Mileage:</span> {car.details.mileage || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Drive:</span> {car.details.drive || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Option:</span> {car.details.option || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Location:</span> {car.details.location || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Condition:</span> {car.details.condition || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Duty:</span> {car.details.duty || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Stock No:</span> {car.details.stock_no || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
        {!car?.details && (
          <p className="text-muted-foreground text-center py-4">
            No details available for this car.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
