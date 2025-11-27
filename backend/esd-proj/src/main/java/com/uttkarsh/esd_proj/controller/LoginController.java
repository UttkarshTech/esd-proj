package com.uttkarsh.esd_proj.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {
    
    @GetMapping("/")
    public String home() {
        return "index";
    }
    
    @GetMapping("/login/success")
    public String loginSuccess(@RequestParam(required = false) String email,
                              @RequestParam(required = false) String name,
                              Model model) {
        model.addAttribute("email", email);
        model.addAttribute("name", name);
        return "success";
    }
    
    @GetMapping("/login/failure")
    public String loginFailure(@RequestParam(required = false) String error, Model model) {
        model.addAttribute("error", error);
        return "failure";
    }
}
