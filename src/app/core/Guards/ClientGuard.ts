import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { env } from 'process';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ClientGuard implements CanActivate {

    constructor(private router: Router) { }
    baseurl = environment.apiRootURL;
    // ... other properties and methods ...
    canActivate(): boolean {
        
        const clientIp = '192.168.1.249'; // Replace with actual logic to get client IP
        const currentIp = this.getClientIp(); // Implement this method to get the actual client IP

        if (currentIp === clientIp) {
            this.router.navigate(['/clockdashboard']);
            return false; // Prevent navigation to the default route
        }

        return true; // Allow navigation to the default route
    }

    private getClientIp(): string {
        
        const parts = this.baseurl.split(':');

        const portAndPath = parts[2].split('/');
        const port = portAndPath[0];

        // Determine the client based on the IP address or port
        let Client: string;
        if (parts[1] === '//192.168.1.249') {
            // Client = clients["192.168.1.249"];
        }
        return parts[1] // Placeholder
    }
}
