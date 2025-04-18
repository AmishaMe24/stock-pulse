from app.services.price_stream import price_stream_producer
from app.services.alert_service import alert_service

class ServiceManager:
    def start_services(self):
        """Start all background services"""
        try:
            # Start the price stream producer
            price_stream_producer.start()
            
            # Start the alert service
            alert_service.start()
            
            print("All services started successfully")
        except Exception as e:
            print(f"Error starting services: {str(e)}")
    
    def stop_services(self):
        """Stop all background services"""
        try:
            # Stop the price stream producer
            price_stream_producer.stop()
            
            # Stop the alert service
            alert_service.stop()
            
            print("All services stopped successfully")
        except Exception as e:
            print(f"Error stopping services: {str(e)}")

# Create a singleton instance
service_manager = ServiceManager()