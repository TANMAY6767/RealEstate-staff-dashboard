import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export function CarMoreInfoDialog({ open, onOpenChange, car }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>More Information - {car?.name}</DialogTitle>
          <DialogDescription>Additional information about {car?.name}</DialogDescription>
        </DialogHeader>
        {car?.moreInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold mb-3 text-primary">Financial Details</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">TP:</span> {car.moreInfo.Tp || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Cost:</span> {car.moreInfo.cost || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Duty:</span> {car.moreInfo.duty || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Total Cost:</span> {car.moreInfo.t_cost || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Exchange Rate:</span> {car.moreInfo.exr || "N/A"}
                </p>
                <p>
                  <span className="font-medium">K Price:</span> {car.moreInfo.k_price || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-7">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Sold Price:</span>{" "}
                  {car.moreInfo.sold_price || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Discount:</span> {car.moreInfo.discount || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Profit:</span> {car.moreInfo.profit || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Commission:</span> {car.moreInfo.comm || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Net Profit:</span>{" "}
                  {car.moreInfo.net_profit || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Sold Date:</span>{" "}
                  {car.moreInfo.sold_date ? formatDate(car.moreInfo.sold_date) : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Sold By:</span> {car.moreInfo.sold_by || "N/A"}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            {(car.moreInfo.customer_name ||
              car.moreInfo.customer_address ||
              car.moreInfo.customer_phone_no) && (
              <div className="col-span-2 mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-3 text-primary">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {car.moreInfo.customer_name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {car.moreInfo.customer_address || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {car.moreInfo.customer_phone_no || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {!car?.moreInfo && (
          <p className="text-muted-foreground text-center py-4">
            No additional information available for this car.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
