import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    isLoginFailed = false;
    errorMessage = '';
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private storageService: StorageService,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (this.storageService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }

        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.isLoading = true;
        const { username, password } = this.loginForm.value;

        this.authService.login({ username, password }).subscribe({
            next: data => {
                // Backend returns map. Let's assume keys: "jwtoken", "username" based on our analysis
                // Or if it's just the token, we'll adapt. 
                // Based on analysis: public Map<String, String> login(@RequestBody Map<String, String> payload)
                // Usually implementation of AuthService.login returns a map containing the token.

                this.storageService.saveToken(data.jwtoken || data.token);
                this.storageService.saveUser(data);

                this.isLoginFailed = false;
                this.isLoading = false;
                this.router.navigate(['/dashboard']);
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Login failed';
                this.isLoginFailed = true;
                this.isLoading = false;
            }
        });
    }
}
